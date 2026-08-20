export interface TravelTipSection {
  heading: string
  items: string[]
}

export interface TravelTip {
  slug: string
  title: string
  category: string
  icon: string
  summary: string
  sections: TravelTipSection[]
}

export const TRAVEL_TIPS: TravelTip[] = [
  {
    slug: 'safety',
    title: 'Staying Safe on the Road',
    category: 'Safety',
    icon: 'shield-check',
    summary: 'The basics that keep a trip from going wrong — before you even leave home.',
    sections: [
      {
        heading: 'Before you go',
        items: [
          'Buy travel insurance that covers medical care, trip cancellation, and lost luggage.',
          'Make copies (digital and paper) of your passport, visa, and ID — store them separately from the originals.',
          'Share your itinerary and accommodation details with someone back home.',
          'Check your government\'s travel advisory for your destination.',
        ],
      },
      {
        heading: 'While traveling',
        items: [
          'Keep valuables split across bags rather than in one place.',
          'Use hotel safes for passports and spare cards when you\'re out exploring.',
          'Stay aware in crowded tourist areas, which are common spots for pickpocketing.',
          'Trust your instincts — if a situation feels off, leave.',
        ],
      },
    ],
  },
  {
    slug: 'transportation',
    title: 'Getting Around Like a Local',
    category: 'Transportation',
    icon: 'train-front',
    summary: 'Public transit, rail passes, and rideshare tips for moving through a new city with ease.',
    sections: [
      {
        heading: 'Public transit',
        items: [
          'Research multi-day transit passes before you arrive — they\'re almost always cheaper than single tickets.',
          'In Japan, prepaid IC cards (Suica, Pasmo) work on nearly all trains, subways, and buses nationwide.',
          'A Japan Rail Pass can be worth it if you\'re covering long distances between cities by shinkansen.',
          'Download offline maps and transit apps before you land — signal isn\'t guaranteed everywhere.',
        ],
      },
      {
        heading: 'Taxis & rideshare',
        items: [
          'Use official taxi ranks or app-based rideshare rather than hailing unmarked cars.',
          'Confirm the fare or that the meter is running before the trip starts.',
          'Keep your hotel address written in the local language to show a driver.',
        ],
      },
    ],
  },
  {
    slug: 'local-culture',
    title: 'Understanding Local Culture',
    category: 'Local Culture',
    icon: 'users',
    summary: 'A little cultural awareness goes further than a phrasebook.',
    sections: [
      {
        heading: 'General etiquette',
        items: [
          'Learn a few greetings and courtesy phrases — locals notice the effort.',
          'Dress modestly when visiting temples, shrines, mosques, or churches.',
          'Observe how locals behave in public spaces before assuming your habits transfer.',
          'Ask before photographing people, especially at religious sites or ceremonies.',
        ],
      },
      {
        heading: 'Tipping norms vary a lot',
        items: [
          'Tipping is not expected — and can even be considered rude — in Japan.',
          'It\'s customary and often built into the bill in much of Europe.',
          'It\'s expected for service staff in the US, typically 15–20%.',
        ],
      },
    ],
  },
  {
    slug: 'food',
    title: 'Eating Well & Safely Abroad',
    category: 'Food',
    icon: 'utensils',
    summary: 'How to find great food without gambling on your stomach.',
    sections: [
      {
        heading: 'Finding good food',
        items: [
          'Follow the lines — busy stalls turn over ingredients fast, which usually means fresher food.',
          'Convenience stores in Japan (konbini) are a genuinely great, affordable meal option.',
          'Ask your accommodation host for their personal favorite spot, not just the top-rated one online.',
        ],
      },
      {
        heading: 'Staying safe',
        items: [
          'Check whether tap water is safe to drink at your destination — bottled water is a safe default if unsure.',
          'Carry a translated allergy card if you have food allergies or dietary restrictions.',
          'Ease into unfamiliar cuisines gradually if you have a sensitive stomach.',
        ],
      },
    ],
  },
  {
    slug: 'money',
    title: 'Managing Money While Traveling',
    category: 'Money',
    icon: 'wallet',
    summary: 'Avoid fees, scams, and getting stuck without cash.',
    sections: [
      {
        heading: 'Before you go',
        items: [
          'Notify your bank and card issuer of your travel dates to avoid a security freeze.',
          'Bring at least one backup card in case one is lost, stolen, or declined.',
          'Look into a no-foreign-transaction-fee card — it adds up over a trip.',
        ],
      },
      {
        heading: 'While there',
        items: [
          'Japan is still largely cash-based outside major cities — carry yen for smaller shops, temples, and rural areas.',
          'Withdraw cash from bank-affiliated ATMs, not standalone kiosks, which often charge steep fees.',
          'Avoid airport currency exchange counters — their rates are usually the worst available.',
        ],
      },
    ],
  },
  {
    slug: 'emergency-information',
    title: 'Emergency Information',
    category: 'Emergency Information',
    icon: 'siren',
    summary: 'What to know before something goes wrong, so you\'re not figuring it out in the moment.',
    sections: [
      {
        heading: 'Emergency numbers',
        items: [
          'Japan: 110 for police, 119 for fire or ambulance.',
          'European Union: 112 works for all emergencies in every member state.',
          'United States & Canada: 911 for all emergencies.',
          'Always confirm the current number for your specific destination before you travel.',
        ],
      },
      {
        heading: 'Be prepared',
        items: [
          'Save your embassy or consulate\'s address and phone number before you land.',
          'Consider registering your trip with your government\'s traveler program, where available.',
          'Keep your travel insurance policy number and emergency hotline accessible offline.',
        ],
      },
    ],
  },
  {
    slug: 'japanese-etiquette',
    title: 'Japanese Etiquette Essentials',
    category: 'Japanese Etiquette',
    icon: 'hand-heart',
    summary: 'Small customs that make a big difference in Japan.',
    sections: [
      {
        heading: 'Everyday manners',
        items: [
          'A slight bow is a common greeting — the deeper the bow, the more formal or respectful it is.',
          'Remove your shoes when entering homes, some restaurants, and traditional inns (ryokan).',
          'Keep conversations quiet on trains, and switch phones to silent mode.',
          'Tipping is not customary and can cause confusion — good service is simply the standard.',
        ],
      },
      {
        heading: 'Onsen (hot spring) etiquette',
        items: [
          'Wash and rinse thoroughly at the shower stations before entering the bath.',
          'Bathe nude — swimsuits are not worn in traditional onsen.',
          'Some onsen restrict visible tattoos; check policies in advance if this applies to you.',
        ],
      },
      {
        heading: 'Dining manners',
        items: [
          'Say "itadakimasu" before eating and "gochisousama" when finished, as a gesture of thanks.',
          'Avoid sticking chopsticks upright in rice — it resembles a funeral ritual.',
          'Slurping noodles is completely normal and even a compliment to the chef.',
        ],
      },
    ],
  },
  {
    slug: 'packing',
    title: 'What to Pack',
    category: 'Packing',
    icon: 'luggage',
    summary: 'A practical checklist that covers most trips, most places.',
    sections: [
      {
        heading: 'Essentials',
        items: [
          'A universal power adapter — Japan uses Type A/B plugs at 100V.',
          'Comfortable, broken-in walking shoes; you\'ll likely walk more than expected.',
          'A portable phone charger for long days out sightseeing.',
          'A compact daypack for carrying water, a camera, and layers.',
        ],
      },
      {
        heading: 'Don\'t forget',
        items: [
          'Any prescription medications, in original packaging with a copy of the prescription.',
          'A portable Wi-Fi router or local SIM/eSIM for reliable data on the go.',
          'Weather-appropriate layers — check seasonal averages for your destination before packing.',
          'A reusable water bottle to refill instead of buying single-use plastic.',
        ],
      },
    ],
  },
  {
    slug: 'visa-information',
    title: 'Visa Information',
    category: 'Visa Information',
    icon: 'stamp',
    summary: 'What to check before you book — requirements vary by nationality and change over time.',
    sections: [
      {
        heading: 'General guidance',
        items: [
          'Many countries offer visa-free or visa-on-arrival entry for short tourist stays, but this depends entirely on your passport\'s nationality.',
          'Japan, for example, allows visa-free entry for tourism for many nationalities for stays up to 90 days — but always verify against your own passport.',
          'Check that your passport has enough validity remaining (commonly 6 months beyond your travel dates) and blank pages for stamps.',
          'Some countries require proof of onward travel or sufficient funds at the border.',
        ],
      },
      {
        heading: 'Always double-check',
        items: [
          'Visa rules change — verify current requirements on your destination\'s official immigration or embassy website before booking flights.',
          'If in doubt, contact the destination\'s embassy or consulate in your home country directly.',
        ],
      },
    ],
  },
  {
    slug: 'japanese-phrases',
    title: 'Useful Japanese Phrases',
    category: 'Useful Japanese Phrases',
    icon: 'languages',
    summary: 'A handful of phrases that cover most everyday situations.',
    sections: [
      {
        heading: 'Greetings & courtesy',
        items: [
          'Konnichiwa — Hello',
          'Ohayou gozaimasu — Good morning',
          'Arigatou gozaimasu — Thank you very much',
          'Sumimasen — Excuse me / Sorry',
          'Onegaishimasu — Please',
        ],
      },
      {
        heading: 'Getting around',
        items: [
          'Toire wa doko desu ka? — Where is the bathroom?',
          'Eki wa doko desu ka? — Where is the station?',
          'Kore o kudasai — I\'ll have this, please',
          'Ikura desu ka? — How much is it?',
        ],
      },
      {
        heading: 'When you need help',
        items: [
          'Eigo o hanasemasu ka? — Do you speak English?',
          'Wakarimasen — I don\'t understand',
          'Tasukete kudasai — Please help me',
        ],
      },
    ],
  },
]

export function getTravelTip(slug: string): TravelTip | undefined {
  return TRAVEL_TIPS.find((tip) => tip.slug === slug)
}
