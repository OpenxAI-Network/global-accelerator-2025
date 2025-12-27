"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import * as d3 from "d3"

interface DataPoint {
  date: Date
  value: number
  volume?: number
}

interface InteractiveChartProps {
  data: DataPoint[]
  width?: number
  height?: number
  color?: string
  showVolume?: boolean
  title?: string
}

export default function InteractiveChart({
  data,
  width = 400,
  height = 200,
  color = "#8b5cf6",
  showVolume = false,
  title,
}: InteractiveChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!svgRef.current || !data.length) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const margin = { top: 20, right: 30, bottom: 30, left: 40 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const xScale = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.date) as [Date, Date])
      .range([0, innerWidth])

    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.value) as [number, number])
      .nice()
      .range([innerHeight, 0])

    const line = d3
      .line<DataPoint>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.value))
      .curve(d3.curveCardinal)

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`)

    // Grid lines
    g.selectAll(".grid-line-x")
      .data(xScale.ticks(5))
      .enter()
      .append("line")
      .attr("class", "grid-line-x")
      .attr("x1", (d) => xScale(d))
      .attr("x2", (d) => xScale(d))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", "#374151")
      .attr("stroke-width", 0.5)
      .attr("opacity", 0.3)

    g.selectAll(".grid-line-y")
      .data(yScale.ticks(5))
      .enter()
      .append("line")
      .attr("class", "grid-line-y")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", (d) => yScale(d))
      .attr("y2", (d) => yScale(d))
      .attr("stroke", "#374151")
      .attr("stroke-width", 0.5)
      .attr("opacity", 0.3)

    // Gradient definition
    const gradient = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", "line-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", innerWidth)
      .attr("y2", 0)

    gradient.append("stop").attr("offset", "0%").attr("stop-color", color).attr("stop-opacity", 1)

    gradient.append("stop").attr("offset", "100%").attr("stop-color", "#06b6d4").attr("stop-opacity", 1)

    // Area under curve
    const area = d3
      .area<DataPoint>()
      .x((d) => xScale(d.date))
      .y0(innerHeight)
      .y1((d) => yScale(d.value))
      .curve(d3.curveCardinal)

    g.append("path").datum(data).attr("fill", "url(#line-gradient)").attr("opacity", 0.1).attr("d", area)

    // Main line
    const path = g
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "url(#line-gradient)")
      .attr("stroke-width", 3)
      .attr("d", line)

    // Animate line drawing
    const totalLength = path.node()?.getTotalLength() || 0
    path
      .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(2000)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0)

    // Data points
    g.selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => xScale(d.date))
      .attr("cy", (d) => yScale(d.value))
      .attr("r", 0)
      .attr("fill", color)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .transition()
      .delay((d, i) => i * 50)
      .duration(500)
      .attr("r", 4)

    // Tooltip interactions
    const tooltip = d3.select(tooltipRef.current)

    g.selectAll(".dot")
      .on("mouseover", function (event, d) {
        d3.select(this).transition().duration(200).attr("r", 6).attr("stroke-width", 3)

        tooltip
          .style("opacity", 1)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 10 + "px")
          .html(`
            <div class="bg-black/90 backdrop-blur-sm border border-purple-500/50 rounded-lg p-3 text-white text-sm">
              <div class="font-medium">${d3.timeFormat("%b %d, %Y")(d.date)}</div>
              <div class="text-purple-400">Value: $${d.value.toLocaleString()}</div>
              ${d.volume ? `<div class="text-cyan-400">Volume: $${d.volume.toLocaleString()}</div>` : ""}
            </div>
          `)
      })
      .on("mouseout", function () {
        d3.select(this).transition().duration(200).attr("r", 4).attr("stroke-width", 2)

        tooltip.style("opacity", 0)
      })
  }, [data, width, height, color, showVolume])

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative">
      {title && <h3 className="text-sm font-medium text-neutral-300 mb-2">{title}</h3>}
      <svg ref={svgRef} width={width} height={height} className="overflow-visible" />
      <div ref={tooltipRef} className="absolute pointer-events-none opacity-0 transition-opacity duration-200 z-10" />
    </motion.div>
  )
}
