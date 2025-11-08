import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { response: 'Please provide a valid message.' },
        { status: 400 }
      );
    }

    const lowerMessage = message.toLowerCase();

    // Simple keyword-based responses
    let response = '';

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      response = 'Hello! Welcome to Pacific Explorer. How can I help you discover Papua New Guinea today?';
    } else if (lowerMessage.includes('satellite') || lowerMessage.includes('copernicus')) {
      response = 'Pacific Explorer uses Copernicus satellite data from the European Space Agency. We provide real-time satellite imagery, environmental monitoring, and AI-powered detection of tourist attractions. You can view satellite layers on our interactive map!';
    } else if (lowerMessage.includes('hotel') || lowerMessage.includes('accommodation')) {
      response = 'We integrate OpenStreetMap data to show hotels, lodges, and accommodations across PNG. Use our map to find nearby options, or check our destinations page for curated recommendations.';
    } else if (lowerMessage.includes('destination') || lowerMessage.includes('explore')) {
      response = 'PNG has incredible destinations: pristine beaches, volcanic landscapes, coral reefs, and cultural sites. Try our interactive map to discover hidden gems powered by satellite technology!';
    } else if (lowerMessage.includes('sustainable') || lowerMessage.includes('eco')) {
      response = 'Sustainable tourism is at our core. We use satellite data to monitor coral health, vegetation, and environmental conditions to help preserve PNG\'s natural beauty.';
    } else if (lowerMessage.includes('webodm') || lowerMessage.includes('processing')) {
      response = 'WebODM is our satellite imagery processing platform. It analyzes drone and satellite photos to create 3D models and maps for detailed exploration planning.';
    } else if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      response = 'I can help you learn about:\n• Satellite-powered destination discovery\n• Hotel and accommodation options\n• Environmental monitoring\n• Sustainable tourism tips\n• Copernicus data and technology\n\nWhat would you like to know more about?';
    } else {
      response = 'I\'m here to help with questions about Pacific Explorer, Copernicus satellite data, destinations in Papua New Guinea, and sustainable tourism. Try asking about hotels, satellite imagery, or specific destinations!';
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Chatbot API error:', error);
    return NextResponse.json(
      { response: 'Sorry, I encountered an error. Please try again.' },
      { status: 500 }
    );
  }
}
