/* ============================================================
   COPA DEL MARE — Données mock (catalogue, tables, config)
   Pour brancher plus tard sur une API : remplacer par fetch()
   ============================================================ */

// Catégories de la carte
const CATEGORIES = ['Tout', 'Entrées', 'Poissons', 'Viandes', 'Pâtes', 'Pizzas', 'Desserts', 'Cocktails', 'Vins'];

// Catalogue produits (id, nom, prix FCFA, catégorie, emoji, description)
const PRODUCTS = [
  { id: 1, name: 'Thon braisé',                price: 8000, category: 'Poissons',  emoji: '🐟',
    desc: 'Thon frais de Bassam, braisé au feu de bois, servi avec alloco et sauce piment maison.' },
  { id: 2, name: 'Blanquette de thon',         price: 7500, category: 'Poissons',  emoji: '🐟',
    desc: 'Thon frais mijoté dans une sauce blanche onctueuse, servi avec du riz parfumé.' },
  { id: 3, name: 'Poisson frit',               price: 7000, category: 'Poissons',  emoji: '🐠',
    desc: 'Poisson frais frit, servi avec attiéké et sauce tomate maison.' },
  { id: 4, name: 'Pizza Mare',                 price: 9000, category: 'Pizzas',    emoji: '🍕',
    desc: 'Base tomate, mozzarella, crevettes, calamars, moules, ail et persil. Pâte fine au feu de bois.' },
  { id: 5, name: 'Pizza Margherita',           price: 7000, category: 'Pizzas',    emoji: '🍕',
    desc: "Tomate, mozzarella, basilic frais, huile d'olive. La simplicité italienne." },
  { id: 6, name: 'Pâtes aux fruits de mer',    price: 8500, category: 'Pâtes',     emoji: '🍝',
    desc: 'Linguine fraîches, crevettes, calamars, moules, tomates cerises, vin blanc et basilic.' },
  { id: 7, name: 'Steak grillé',               price: 9500, category: 'Viandes',   emoji: '🥩',
    desc: 'Steak de bœuf grillé, servi avec frites maison et sauce au poivre.' },
  { id: 8, name: 'Cocktail maison',            price: 5000, category: 'Cocktails', emoji: '🍹',
    desc: 'Cocktail signature au rhum, fruits frais et sirop maison.' }
];

// Produits "signature" affichés sur la page d'accueil
const SIGNATURE_IDS = [1, 4, 6];

// Tables du plan de salle (mock)
const TABLES = [
  { id: 1, num: 'Table 1', zone: 'Terrasse', couverts: 4, status: 'libre', info: 'Libre' },
  { id: 2, num: 'Table 2', zone: 'Terrasse', couverts: 2, status: 'occ',   info: '1 h 12' },
  { id: 3, num: 'Table 3', zone: 'Salle',    couverts: 6, status: 'res',   info: '20:30' },
  { id: 4, num: 'Table 4', zone: 'Salle',    couverts: 4, status: 'libre', info: 'Libre' },
  { id: 5, num: 'Bar 1',   zone: 'Bar',      couverts: 2, status: 'occ',   info: '0 h 25' },
  { id: 6, num: 'Table 5', zone: 'Terrasse', couverts: 4, status: 'libre', info: 'Libre' }
];

// Paramètres de la boutique
const SHOP_CONFIG = {
  deliveryFee: 1500,      // frais de livraison FCFA
  loyaltyDiscount: 500,   // remise fidélité FCFA
  currency: 'F'
};

// Helper format prix
function formatPrice(n) {
  return n.toLocaleString('fr-FR').replace(/\u202f/g, ' ') + ' ' + SHOP_CONFIG.currency;
}