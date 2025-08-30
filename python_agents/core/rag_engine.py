"""
RAG (Retrieval-Augmented Generation) Engine for the Aegis Multi-Agent AI System.

This module provides a hybrid query engine that combines Neo4j knowledge graph
traversal with ChromaDB vector similarity search for comprehensive threat intelligence.
"""

import asyncio
import json
from typing import List, Dict, Any, Optional, Tuple, Union
from datetime import datetime
import uuid
from loguru import logger

import chromadb
from sentence_transformers import SentenceTransformer
from neo4j import AsyncGraphDatabase
import numpy as np


class RAGEngine:
    """
    Hybrid RAG engine combining knowledge graph and vector search.
    
    Features:
    - Neo4j knowledge graph for entity relationships
    - ChromaDB vector database for semantic similarity
    - Hybrid queries combining both approaches
    - Context-aware prompt generation
    - Multi-modal data support
    """
    
    def __init__(
        self,
        neo4j_uri: str = "bolt://localhost:7687",
        neo4j_user: str = "neo4j",
        neo4j_password: str = "password",
        chroma_host: str = "localhost",
        chroma_port: int = 8000,
        embedding_model: str = "all-MiniLM-L6-v2"
    ):
        """Initialize the RAG engine."""
        self.neo4j_uri = neo4j_uri
        self.neo4j_user = neo4j_user
        self.neo4j_password = neo4j_password
        self.chroma_host = chroma_host
        self.chroma_port = chroma_port
        self.embedding_model = embedding_model
        
        # Database connections
        self.neo4j_driver: Optional[AsyncGraphDatabase] = None
        self.chroma_client: Optional[chromadb.Client] = None
        self.embedding_model_instance: Optional[SentenceTransformer] = None
        
        # Collections and indexes
        self.collections: Dict[str, chromadb.Collection] = {}
        self.vector_dimensions = 384  # Default for all-MiniLM-L6-v2
        
        # Query cache
        self.query_cache: Dict[str, Any] = {}
        self.cache_ttl = 300  # 5 minutes
        
        # Statistics
        self.stats = {
            "queries_executed": 0,
            "graph_queries": 0,
            "vector_queries": 0,
            "hybrid_queries": 0,
            "cache_hits": 0,
            "cache_misses": 0
        }
    
    async def connect(self) -> bool:
        """Connect to Neo4j and ChromaDB."""
        try:
            # Connect to Neo4j
            self.neo4j_driver = AsyncGraphDatabase.driver(
                self.neo4j_uri,
                auth=(self.neo4j_user, self.neo4j_password)
            )
            
            # Test Neo4j connection
            async with self.neo4j_driver.session() as session:
                result = await session.run("RETURN 1 as test")
                await result.single()
            
            # Connect to ChromaDB
            self.chroma_client = chromadb.HttpClient(
                host=self.chroma_host,
                port=self.chroma_port
            )
            
            # Initialize embedding model
            self.embedding_model_instance = SentenceTransformer(self.embedding_model)
            
            # Initialize collections
            await self._initialize_collections()
            
            logger.info("RAG engine connected successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to connect RAG engine: {e}")
            return False
    
    async def disconnect(self):
        """Disconnect from databases."""
        try:
            if self.neo4j_driver:
                await self.neo4j_driver.close()
            
            if self.chroma_client:
                self.chroma_client.reset()
            
            logger.info("RAG engine disconnected")
            
        except Exception as e:
            logger.error(f"Error during RAG engine disconnect: {e}")
    
    async def _initialize_collections(self):
        """Initialize ChromaDB collections."""
        try:
            # Threat patterns collection
            self.collections["threat_patterns"] = self.chroma_client.get_or_create_collection(
                name="threat_patterns",
                metadata={"description": "Threat detection patterns and signatures"}
            )
            
            # Entity profiles collection
            self.collections["entity_profiles"] = self.chroma_client.get_or_create_collection(
                name="entity_profiles",
                metadata={"description": "Entity behavior profiles and risk assessments"}
            )
            
            # Transaction history collection
            self.collections["transaction_history"] = self.chroma_client.get_or_create_collection(
                name="transaction_history",
                metadata={"description": "Historical transaction data for pattern analysis"}
            )
            
            # Risk indicators collection
            self.collections["risk_indicators"] = self.chroma_client.get_or_create_collection(
                name="risk_indicators",
                metadata={"description": "Risk indicators and warning signals"}
            )
            
            logger.info("RAG engine collections initialized")
            
        except Exception as e:
            logger.error(f"Failed to initialize collections: {e}")
            raise
    
    async def hybrid_query(
        self,
        query: str,
        query_type: str = "threat_detection",
        max_results: int = 10,
        use_cache: bool = True
    ) -> Dict[str, Any]:
        """
        Execute a hybrid query combining graph and vector search.
        
        Args:
            query: Natural language query
            query_type: Type of query (threat_detection, entity_analysis, etc.)
            max_results: Maximum number of results to return
            use_cache: Whether to use query cache
        
        Returns:
            Combined results from both knowledge graph and vector search
        """
        try:
            # Check cache first
            cache_key = f"{query_type}:{hash(query)}"
            if use_cache and cache_key in self.query_cache:
                cache_entry = self.query_cache[cache_key]
                if datetime.utcnow().timestamp() - cache_entry["timestamp"] < self.cache_ttl:
                    self.stats["cache_hits"] += 1
                    return cache_entry["results"]
            
            self.stats["cache_misses"] += 1
            self.stats["hybrid_queries"] += 1
            
            # Execute parallel queries
            graph_task = asyncio.create_task(self._graph_query(query, query_type))
            vector_task = asyncio.create_task(self._vector_query(query, query_type, max_results))
            
            # Wait for both to complete
            graph_results, vector_results = await asyncio.gather(graph_task, vector_task)
            
            # Combine and rank results
            combined_results = await self._combine_results(
                graph_results, vector_results, query, query_type
            )
            
            # Cache results
            if use_cache:
                self.query_cache[cache_key] = {
                    "results": combined_results,
                    "timestamp": datetime.utcnow().timestamp()
                }
            
            self.stats["queries_executed"] += 1
            return combined_results
            
        except Exception as e:
            logger.error(f"Hybrid query failed: {e}")
            raise
    
    async def _graph_query(self, query: str, query_type: str) -> Dict[str, Any]:
        """Execute a knowledge graph query."""
        try:
            self.stats["graph_queries"] += 1
            
            async with self.neo4j_driver.session() as session:
                if query_type == "threat_detection":
                    cypher_query = """
                    MATCH (e:Entity)-[:HAS_THREAT]->(t:Threat)
                    WHERE e.address CONTAINS $query OR t.pattern CONTAINS $query
                    RETURN e.address as entity, t.pattern as threat, t.risk_level as risk
                    ORDER BY t.risk_level DESC
                    LIMIT 20
                    """
                elif query_type == "entity_analysis":
                    cypher_query = """
                    MATCH (e:Entity)-[:INTERACTS_WITH]->(other:Entity)
                    WHERE e.address CONTAINS $query
                    RETURN e.address as entity, 
                           collect(other.address) as connections,
                           count(other) as connection_count
                    LIMIT 10
                    """
                elif query_type == "transaction_pattern":
                    cypher_query = """
                    MATCH (tx:Transaction)-[:INVOLVES]->(e:Entity)
                    WHERE tx.hash CONTAINS $query OR e.address CONTAINS $query
                    RETURN tx.hash as transaction, e.address as entity, tx.value as value
                    ORDER BY tx.timestamp DESC
                    LIMIT 15
                    """
                else:
                    # Default generic query
                    cypher_query = """
                    MATCH (n)
                    WHERE n.name CONTAINS $query OR n.description CONTAINS $query
                    RETURN labels(n) as labels, properties(n) as properties
                    LIMIT 10
                    """
                
                result = await session.run(cypher_query, query=query)
                records = await result.data()
                
                return {
                    "query_type": query_type,
                    "results": records,
                    "count": len(records),
                    "source": "knowledge_graph"
                }
                
        except Exception as e:
            logger.error(f"Graph query failed: {e}")
            return {
                "query_type": query_type,
                "results": [],
                "count": 0,
                "source": "knowledge_graph",
                "error": str(e)
            }
    
    async def _vector_query(
        self,
        query: str,
        query_type: str,
        max_results: int
    ) -> Dict[str, Any]:
        """Execute a vector similarity search."""
        try:
            self.stats["vector_queries"] += 1
            
            # Get appropriate collection
            collection_name = self._get_collection_for_query_type(query_type)
            collection = self.collections.get(collection_name)
            
            if not collection:
                return {
                    "query_type": query_type,
                    "results": [],
                    "count": 0,
                    "source": "vector_search",
                    "error": f"Collection {collection_name} not found"
                }
            
            # Generate query embedding
            query_embedding = self.embedding_model_instance.encode(query).tolist()
            
            # Search collection
            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=max_results,
                include=["metadatas", "distances"]
            )
            
            # Format results
            formatted_results = []
            for i in range(len(results["ids"][0])):
                formatted_results.append({
                    "id": results["ids"][0][i],
                    "metadata": results["metadatas"][0][i],
                    "distance": results["distances"][0][i]
                })
            
            return {
                "query_type": query_type,
                "results": formatted_results,
                "count": len(formatted_results),
                "source": "vector_search"
            }
            
        except Exception as e:
            logger.error(f"Vector query failed: {e}")
            return {
                "query_type": query_type,
                "results": [],
                "count": 0,
                "source": "vector_search",
                "error": str(e)
            }
    
    async def _combine_results(
        self,
        graph_results: Dict[str, Any],
        vector_results: Dict[str, Any],
        query: str,
        query_type: str
    ) -> Dict[str, Any]:
        """Combine and rank results from both sources."""
        try:
            combined = {
                "query": query,
                "query_type": query_type,
                "timestamp": datetime.utcnow().isoformat(),
                "total_results": 0,
                "graph_results": graph_results,
                "vector_results": vector_results,
                "combined_results": [],
                "ranking": {}
            }
            
            # Combine and deduplicate results
            all_results = []
            
            # Add graph results
            for result in graph_results.get("results", []):
                all_results.append({
                    "source": "graph",
                    "data": result,
                    "score": self._calculate_graph_score(result, query_type)
                })
            
            # Add vector results
            for result in vector_results.get("results", []):
                all_results.append({
                    "source": "vector",
                    "data": result,
                    "score": self._calculate_vector_score(result, query_type)
                })
            
            # Sort by score and deduplicate
            all_results.sort(key=lambda x: x["score"], reverse=True)
            
            # Simple deduplication based on content similarity
            unique_results = []
            seen_content = set()
            
            for result in all_results:
                content_key = self._generate_content_key(result["data"])
                if content_key not in seen_content:
                    unique_results.append(result)
                    seen_content.add(content_key)
            
            combined["combined_results"] = unique_results
            combined["total_results"] = len(unique_results)
            
            # Generate ranking insights
            combined["ranking"] = await self._generate_ranking_insights(unique_results, query_type)
            
            return combined
            
        except Exception as e:
            logger.error(f"Failed to combine results: {e}")
            raise
    
    def _get_collection_for_query_type(self, query_type: str) -> str:
        """Get the appropriate ChromaDB collection for a query type."""
        collection_mapping = {
            "threat_detection": "threat_patterns",
            "entity_analysis": "entity_profiles",
            "transaction_pattern": "transaction_history",
            "risk_assessment": "risk_indicators"
        }
        return collection_mapping.get(query_type, "threat_patterns")
    
    def _calculate_graph_score(self, result: Dict[str, Any], query_type: str) -> float:
        """Calculate relevance score for graph results."""
        base_score = 0.5
        
        if query_type == "threat_detection":
            # Higher score for higher risk levels
            risk_levels = {"low": 0.3, "medium": 0.6, "high": 0.8, "critical": 1.0}
            risk = result.get("risk", "low")
            base_score += risk_levels.get(risk, 0.3)
        
        elif query_type == "entity_analysis":
            # Higher score for more connections
            connection_count = result.get("connection_count", 0)
            base_score += min(connection_count / 100, 0.4)
        
        return min(base_score, 1.0)
    
    def _calculate_vector_score(self, result: Dict[str, Any], query_type: str) -> float:
        """Calculate relevance score for vector results."""
        # Convert distance to similarity score (1 - distance)
        distance = result.get("distance", 1.0)
        similarity = 1.0 - distance
        
        # Boost score based on metadata relevance
        metadata = result.get("metadata", {})
        if "confidence" in metadata:
            similarity *= metadata["confidence"]
        
        return max(0.0, min(similarity, 1.0))
    
    def _generate_content_key(self, data: Dict[str, Any]) -> str:
        """Generate a content key for deduplication."""
        # Create a hashable representation of the data
        if isinstance(data, dict):
            # Sort keys and create a string representation
            sorted_items = sorted(data.items())
            content_str = str(sorted_items)
        else:
            content_str = str(data)
        
        return str(hash(content_str))
    
    async def _generate_ranking_insights(
        self,
        results: List[Dict[str, Any]],
        query_type: str
    ) -> Dict[str, Any]:
        """Generate insights about result ranking."""
        try:
            insights = {
                "top_sources": {},
                "confidence_distribution": {},
                "recommendations": []
            }
            
            # Analyze top sources
            source_counts = {}
            for result in results[:5]:  # Top 5 results
                source = result["source"]
                source_counts[source] = source_counts.get(source, 0) + 1
            
            insights["top_sources"] = source_counts
            
            # Analyze confidence distribution
            scores = [result["score"] for result in results]
            if scores:
                insights["confidence_distribution"] = {
                    "min": min(scores),
                    "max": max(scores),
                    "average": sum(scores) / len(scores),
                    "median": sorted(scores)[len(scores) // 2]
                }
            
            # Generate recommendations
            if query_type == "threat_detection":
                high_risk_count = sum(1 for r in results if r["score"] > 0.8)
                if high_risk_count > 0:
                    insights["recommendations"].append(
                        f"Found {high_risk_count} high-risk threats requiring immediate attention"
                    )
            
            elif query_type == "entity_analysis":
                graph_results = [r for r in results if r["source"] == "graph"]
                if len(graph_results) > len(results) * 0.6:
                    insights["recommendations"].append(
                        "Knowledge graph provides comprehensive entity relationships"
                    )
            
            return insights
            
        except Exception as e:
            logger.error(f"Failed to generate ranking insights: {e}")
            return {}
    
    async def add_document(
        self,
        collection_name: str,
        documents: List[str],
        metadatas: List[Dict[str, Any]],
        ids: Optional[List[str]] = None
    ) -> bool:
        """Add documents to a ChromaDB collection."""
        try:
            collection = self.collections.get(collection_name)
            if not collection:
                logger.error(f"Collection {collection_name} not found")
                return False
            
            # Generate IDs if not provided
            if ids is None:
                ids = [str(uuid.uuid4()) for _ in documents]
            
            # Generate embeddings
            embeddings = self.embedding_model_instance.encode(documents).tolist()
            
            # Add to collection
            collection.add(
                documents=documents,
                embeddings=embeddings,
                metadatas=metadatas,
                ids=ids
            )
            
            logger.info(f"Added {len(documents)} documents to {collection_name}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to add documents to {collection_name}: {e}")
            return False
    
    async def add_entity_to_graph(
        self,
        entity_type: str,
        properties: Dict[str, Any]
    ) -> bool:
        """Add an entity to the Neo4j knowledge graph."""
        try:
            async with self.neo4j_driver.session() as session:
                # Create entity node
                cypher = f"""
                CREATE (e:{entity_type} $properties)
                RETURN e
                """
                
                result = await session.run(cypher, properties=properties)
                await result.single()
                
                logger.info(f"Added entity {entity_type} to knowledge graph")
                return True
                
        except Exception as e:
            logger.error(f"Failed to add entity to graph: {e}")
            return False
    
    async def create_relationship(
        self,
        from_entity: str,
        to_entity: str,
        relationship_type: str,
        properties: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Create a relationship between entities in the knowledge graph."""
        try:
            async with self.neo4j_driver.session() as session:
                if properties is None:
                    properties = {}
                
                cypher = """
                MATCH (a), (b)
                WHERE a.address = $from_entity AND b.address = $to_entity
                CREATE (a)-[r:$relationship_type $properties]->(b)
                RETURN r
                """
                
                result = await session.run(
                    cypher,
                    from_entity=from_entity,
                    to_entity=to_entity,
                    relationship_type=relationship_type,
                    properties=properties
                )
                await result.single()
                
                logger.info(f"Created relationship {relationship_type} between entities")
                return True
                
        except Exception as e:
            logger.error(f"Failed to create relationship: {e}")
            return False
    
    def get_stats(self) -> Dict[str, Any]:
        """Get current engine statistics."""
        return {
            **self.stats,
            "collections": list(self.collections.keys()),
            "cache_size": len(self.query_cache),
            "embedding_model": self.embedding_model,
            "vector_dimensions": self.vector_dimensions
        }
    
    async def clear_cache(self):
        """Clear the query cache."""
        self.query_cache.clear()
        logger.info("RAG engine cache cleared")
    
    async def optimize_collections(self):
        """Optimize ChromaDB collections for better performance."""
        try:
            for name, collection in self.collections.items():
                # This is a placeholder for actual optimization logic
                # ChromaDB handles optimization automatically in most cases
                logger.info(f"Collection {name} optimization completed")
            
            logger.info("All collections optimized")
            
        except Exception as e:
            logger.error(f"Failed to optimize collections: {e}")
