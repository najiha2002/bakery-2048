const GRID_SIZE = 4;
const CANVAS_SIZE = 400;
const TILE_SIZE = 85;
const TILE_GAP = 12;

// tile labels mapping
const TILE_LABELS = {
    2: { emoji: '🌾', name: 'Flour' },
    4: { emoji: '🥚', name: 'Egg' },
    8: { emoji: '🧈', name: 'Butter' },
    16: { emoji: '🍬', name: 'Sugar' },
    32: { emoji: '🍩', name: 'Donut' },
    64: { emoji: '🍪', name: 'Cookie' },
    128: { emoji: '🧁', name: 'Cupcake' },
    256: { emoji: '🍰', name: 'Slice Cake' },
    512: { emoji: '🎂', name: 'Whole Cake' },
    1024: { emoji: '🥐', name: 'Croissant' },
    2048: { emoji: '🥧', name: 'Pie' },
    4096: { emoji: '👨‍🍳', name: 'MasterChef' }
};

const COLORS = {
    background: '#faf8ef',
    gridBackground: '#bbada0',
    emptyTile: '#cdc1b4',
    text: '#776e65',
    brightText: '#f9f6f2',
    0: '#cdc1b4',
    2: '#fcefe6',
    4: '#f2e8cb',
    8: '#f5b682',
    16: '#f29446',
    32: '#f88973ff',
    64: '#ed7056ff',
    128: '#ede291',
    256: '#fce130',
    512: '#ffdb4a',
    1024: '#f0b922',
    2048: '#fad74d',
    4096: '#3c3a32',
    8192: '#3c3a32'
};
