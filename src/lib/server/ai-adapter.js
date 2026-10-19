/**
 * AI Concierge Adapter Boundary — Node 2 Scaffold
 *
 * NOTE: In Node 2, this is a deterministic, grounded mock adapter.
 * It simulates the server-side assistant boundary without requiring external
 * AI API keys or making ungrounded claims. Real LLM providers and database
 * semantic retrieval will be wired in Node 12.
 */

import { PRODUCTS, CATEGORIES } from '../../data/fixtures';

export async function processConciergeQuery({ message, sessionId = 'demo-session' }) {
  const query = (message || '').trim().toLowerCase();

  // Simulate network/thinking latency
  await new Promise((resolve) => setTimeout(resolve, 350));

  // Security / Privacy guardrail checks
  if (query.includes('cost') || query.includes('supplier') || query.includes('margin') || query.includes('wholesale price') || query.includes('profit')) {
    return {
      reply: "I do not have access to proprietary supplier costs, commercial margins, or internal business records. I can assist you with product details, materials, care guides, ring sizing, or order status inquiries.",
      suggestions: ["How do I care for my jewellery?", "What ring sizes are available?", "Tell me about return policy"],
      isGrounded: true,
      demoMode: true
    };
  }

  if (query.includes('prompt') || query.includes('ignore rules') || query.includes('system instructions')) {
    return {
      reply: "I am NISHKÈA's Shopping Concierge (Demo). My responses are strictly confined to published jewellery details, care recommendations, and customer service guidelines.",
      suggestions: ["Show me earrings", "What is the return policy?", "Browse necklaces"],
      isGrounded: true,
      demoMode: true
    };
  }

  // Jewellery care queries
  if (query.includes('care') || query.includes('clean') || query.includes('wash') || query.includes('maintain') || query.includes('water')) {
    return {
      reply: "To preserve your NISHKÈA jewellery: store each piece individually in an airtight pouch, keep away from water, perfumes, and cosmetics, and gently buff with a soft microfiber cloth after wear. Remove before showering, swimming, or sleeping.",
      suggestions: ["Browse earrings", "Can I return an item?", "Do you have velvet chokers?"],
      isGrounded: true,
      demoMode: true
    };
  }

  // Ring sizing queries
  if (query.includes('size') || query.includes('ring') || query.includes('fit') || query.includes('measure')) {
    return {
      reply: "Our rings are crafted in standard US sizes (Size 6: 16.5mm, Size 7: 17.3mm, Size 8: 18.1mm), alongside selected adjustable comfort-fit designs. We recommend measuring the inner diameter of a well-fitting ring or visiting a local jeweller for precise ring mandrel sizing.",
      suggestions: ["Browse Rings", "Celeste Solitaire details", "Earring sales units"],
      isGrounded: true,
      demoMode: true
    };
  }

  // Return policy queries
  if (query.includes('return') || query.includes('refund') || query.includes('exchange') || query.includes('shipping')) {
    return {
      reply: "Under our provisional customer policy, unworn items in original security packaging with intact tags can be returned within 7 days of delivery. For hygiene reasons, nose rings and pierced earrings are non-returnable unless defective on arrival. (Note: Full statutory policy requires final business sign-off before launch).",
      suggestions: ["Browse catalogue", "Contact customer support", "Care instructions"],
      isGrounded: true,
      demoMode: true
    };
  }

  // Earring sold as pairs?
  if (query.includes('earring') && (query.includes('pair') || query.includes('single') || query.includes('one'))) {
    return {
      reply: "All NISHKÈA earrings are sold strictly by the pair unless explicitly designated as a 'Single Ear Cuff' in the title. Each pair comes safely mounted on our signature jewellery card.",
      suggestions: ["Browse Earrings", "View Aurelia Chandelier", "Astrid Huggies"],
      isGrounded: true,
      demoMode: true
    };
  }

  // Search product suggestions
  const matchedProducts = PRODUCTS.filter(p => 
    p.name.toLowerCase().includes(query) || 
    p.category.toLowerCase().includes(query) ||
    p.description.toLowerCase().includes(query)
  );

  if (matchedProducts.length > 0) {
    const p = matchedProducts[0];
    return {
      reply: `I found "${p.name}" in our ${p.categoryName} collection (${p.salesUnit === 'pair' ? 'Sold as pair' : 'Per piece'}). Crafted in ${p.materials.split(',')[0]}. Would you like to view its detail page?`,
      link: `/products/${p.slug}`,
      linkText: `View ${p.name}`,
      suggestions: [`View ${p.name}`, "Check jewellery care", "Return policy"],
      isGrounded: true,
      demoMode: true
    };
  }

  // Default response
  return {
    reply: "Welcome to NISHKÈA! I am the automated Concierge Demo. I can answer questions about our 5 categories (Earrings, Rings, Necklaces, Hair Accessories, and Nose Rings), materials, care tips, and ring sizing.",
    suggestions: [
      "How do I care for gold-plated jewellery?",
      "What ring sizes do you offer?",
      "Are earrings sold as pairs?",
      "What is your return policy?"
    ],
    isGrounded: true,
    demoMode: true
  };
}
