# MWI Avatar Plus

Advanced combat visualization system for Milky Way Idle with animated attack lines, custom avatars, and particle effects.

## ✨ Features

### 🎨 Visual Effects
- **Attack Animations**: Fireball, arrow, and melee attack animations
- **Damage Lines**: Animated curved lines showing attack trajectories
- **Hit Effects**: Particle explosions and impact animations
- **Healing Particles**: Soothing healing effect animations
- **Miss Indicators**: Visual feedback for missed attacks

### 🖼️ Custom Avatars
- Upload custom avatar images
- Persistent across sessions
- Automatically applied in combat and UI

### ⚙️ Customization
- **Per-Player Settings**: Individual animation types for each party member
- **Color Customization**: Custom colors for damage lines and frames
- **Attack Types**: Choose between melee, ranged, or mage animations
- **Fireball Colors**: Green, red, or blue fireballs for mage attacks
- **Toggle Options**: Enable/disable specific effects

### 🌍 Internationalization
- English and Chinese (ZH) language support
- Automatic language detection from game settings

## 📦 Installation

### Current (Monolithic Version)
1. Install [Tampermonkey](https://www.tampermonkey.net/)
2. Copy the content of `combat_animation.js`
3. Create a new userscript in Tampermonkey
4. Paste and save
5. Refresh Milky Way Idle

### Future (Modular Version - Coming Soon)
The script will be refactored into modules for better maintainability:
```
mwi-avatar-plus/
├── mwi-avatar-plus.user.js    # Main entry point
└── modules/                   # Modular components (planned)
```

## 🎮 Usage

### Settings Panel
Access settings through the game's Settings panel:
- **Custom Avatar**: Upload and enable custom avatar image
- **Attack Animations**: Configure animation type for each player
- **Damage Lines**: Customize colors for attack lines
- **Damage Frames**: Customize colors for damage number frames
- **Effects**: Toggle particle effects and other visual enhancements

### Controls
- **Line Colors**: Click color preview boxes to open color picker
- **Animation Types**: Select melee/ranged/mage per player
- **Fireball Colors**: Choose fireball color for mage attacks

## 🎨 Animation Types

### Melee (⚔️)
- Granite Bludgeon swing animation
- Direct impact on target
- Crushing particle effects

### Ranged (🏹)
- Arrow projectile animation
- Parabolic trajectory
- Arrow trail particles

### Mage (🔮)
- Fireball projectile (3 color options)
- Magical particle trail
- Explosion on impact

## 🖼️ Assets

### Granite Bludgeon
Located in `assets/Granite_bludgeon.svg` - Used for melee attack animations.

## 🧪 Development

### Test Files
- `dev/example_combat_page.html` - Combat simulation page for testing
- `dev/partyInfo.html` - Party info panel test page

## 🔧 Technical Details

### Performance
- Animation pooling system (max 50 concurrent animations)
- Automatic cooldown when limit reached
- Efficient SVG rendering and cleanup

### Compatibility
- Works on `milkywayidle.com` and `test.milkywayidle.com`
- WebSocket hook for real-time combat tracking
- MutationObserver for dynamic avatar updates

## 📝 Settings Storage

All settings are stored in `localStorage` under the key `tracker_settingsMap`.

## 🐛 Known Issues

- None currently reported

## 🚀 Roadmap

- [ ] Refactor into modular architecture
- [ ] Add more animation types
- [ ] Custom sound effects
- [ ] Animation presets
- [ ] Export/import settings

## 📄 License

MIT
