import { NextRequest, NextResponse } from "next/server";
import ollama from "ollama";
import { promises as fs } from 'fs';
import path from 'path';

// In-memory storage for demo purposes
let listings: any[] = [];

// Simulated cleanup job: mark items as completed a week after marked delivered
function scheduleAutoComplete(listingId: string) {
  // 7 days in ms
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  setTimeout(() => {
    const idx = listings.findIndex(l => l.id === listingId);
    if (idx !== -1 && listings[idx].status === 'delivered') {
      listings[idx].status = 'completed';
      listings[idx].completedAt = new Date().toISOString();
    }
  }, weekMs);
}

const model = "llama3.2:1b";

// Fallback keyword-based moderation
const prohibitedKeywords = [
  'drug', 'drugs', 'marijuana', 'cannabis', 'cocaine', 'heroin', 'meth',
  'weapon', 'gun', 'knife', 'bomb', 'explosive',
  'porn', 'pornography', 'adult', 'sex', 'sexual',
  'fraud', 'scam', 'fake', 'counterfeit',
  'tobacco', 'cigarette', 'cigar', 'vape', 'e-cigarette',
  'alcohol', 'beer', 'wine', 'liquor'
];

const inappropriateKeywords = [
  'hate', 'racist', 'discrimination', 'offensive',
  'illegal', 'stolen', 'theft'
];

async function moderateContent(title: string, description: string): Promise<{approved: boolean, reason?: string}> {
  try {
    // Try AI moderation first
    const moderationPrompt = `
You are a content moderator for a student marketplace. Review the following item listing for appropriateness:

Title: "${title}"
Description: "${description}"

Check for:
1. Illegal items (drugs, weapons, stolen goods)
2. Inappropriate content (adult material, hate speech)
3. Prohibited items (tobacco, alcohol, e-cigarettes)
4. Misleading or fraudulent content

Respond with only "APPROVED" if the content is appropriate, or "REJECTED: [reason]" if it violates guidelines.

Guidelines:
- No illegal items
- No inappropriate or offensive content
- No fake or misleading listings
- No tobacco, alcohol, or vaping products
- Be respectful and honest
`;

    const response = await ollama.chat({
      model,
      messages: [{ role: "user", content: moderationPrompt }],
    });

    const result = response.message.content.trim();
    
    if (result === "APPROVED") {
      return { approved: true };
    } else if (result.startsWith("REJECTED:")) {
      return { approved: false, reason: result.replace("REJECTED:", "").trim() };
    } else {
      // Fallback to keyword-based moderation
      return moderateWithKeywords(title, description);
    }
  } catch (error) {
    console.error('AI moderation failed, using fallback:', error);
    // Fallback to keyword-based moderation
    return moderateWithKeywords(title, description);
  }
}

function moderateWithKeywords(title: string, description: string): {approved: boolean, reason?: string} {
  const content = `${title} ${description}`.toLowerCase();
  
  // Check for prohibited keywords
  for (const keyword of prohibitedKeywords) {
    if (content.includes(keyword)) {
      return { 
        approved: false, 
        reason: `Content contains prohibited items or substances (${keyword})` 
      };
    }
  }
  
  // Check for inappropriate keywords
  for (const keyword of inappropriateKeywords) {
    if (content.includes(keyword)) {
      return { 
        approved: false, 
        reason: `Content may be inappropriate or offensive (${keyword})` 
      };
    }
  }
  
  return { approved: true };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const school = searchParams.get('school');
    const category = searchParams.get('category');
    const sortBy = searchParams.get('sortBy');
    const q = searchParams.get('q');

    let filteredListings = listings.filter(listing => listing.status === 'active');

    if (school) {
      filteredListings = filteredListings.filter(listing => listing.school === school);
    }

    if (category && category !== 'all') {
      filteredListings = filteredListings.filter(listing => listing.category === category);
    }

    if (q) {
        filteredListings = filteredListings.filter(listing =>
            listing.title.toLowerCase().includes(q.toLowerCase()) ||
            listing.description.toLowerCase().includes(q.toLowerCase())
        );
    }

    if (sortBy === 'price-asc') {
        filteredListings.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
        filteredListings.sort((a, b) => b.price - a.price);
    } else {
        filteredListings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return NextResponse.json({ listings: filteredListings });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Failed to get listings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());

    // Validate required fields
    if (!data.title || !data.description || data.price === undefined || data.price === null || !data.category || !data.condition || !data.seller) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate price
    const price = parseFloat(data.price as string);
    if (isNaN(price) || price < 0) {
      return NextResponse.json(
        { error: "Invalid price" },
        { status: 400 }
      );
    }

    // Moderate content
    const moderationResult = await moderateContent(data.title as string, data.description as string);

    const images = formData.getAll('images') as File[];
    const imageUrls: string[] = [];

    if (images.length > 0) {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await fs.mkdir(uploadDir, { recursive: true });

        for (const image of images) {
            const imageName = `${Date.now()}-${image.name}`;
            const imagePath = path.join(uploadDir, imageName);
            const imageBuffer = Buffer.from(await image.arrayBuffer());
            await fs.writeFile(imagePath, imageBuffer);
            imageUrls.push(`/uploads/${imageName}`);
        }
    }

    const sellerFromClient = JSON.parse(data.seller as string);

    const listing = {
      id: `listing_${Date.now()}`,
      title: (data.title as string).trim(),
      description: (data.description as string).trim(),
      price: price,
      category: data.category,
      condition: data.condition,
      seller: {
        id: userId,
        name: sellerFromClient.name,
        school: sellerFromClient.school,
        email: sellerFromClient.email,
        verified: sellerFromClient.verified
      },
      school: sellerFromClient.school,
      images: imageUrls,
      videos: [], // Video upload not implemented
      createdAt: new Date().toISOString(),
      status: moderationResult.approved ? 'active' : 'rejected',
      moderationResult: moderationResult
    };

    listings.push(listing);

    if (moderationResult.approved) {
      return NextResponse.json({ listing });
    } else {
      return NextResponse.json(
        {
          error: "Listing rejected by moderation",
          moderationResult: moderationResult
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Failed to create listing" },
      { status: 500 }
    );
  }
}

// PATCH to update listing status (e.g., purchased, shipped, delivered)
export async function PATCH(request: NextRequest) {
  try {
    const userId = await getUserFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { id, status } = data;
    const idx = listings.findIndex(l => l.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (listings[idx].seller.id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    listings[idx].status = status;
    listings[idx].updatedAt = new Date().toISOString();
    if (status === 'delivered') {
      scheduleAutoComplete(id);
    }
    return NextResponse.json({ listing: listings[idx] });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Failed to update listing" },
      { status: 500 }
    );
  }
}

import { jwtVerify } from 'jose';

async function getUserFromToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!));
    return payload.userId as number;
  } catch (error) {
    return null;
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await request.json();
    const idx = listings.findIndex(l => l.id === id);

    if (idx === -1) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (listings[idx].seller.id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    listings.splice(idx, 1);

    return NextResponse.json({ message: 'Listing deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Failed to delete listing" },
      { status: 500 }
    );
  }
}



