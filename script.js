document.addEventListener('DOMContentLoaded', () => {
    // --- Color Conversion & Harmony Logic ---

    function hexToHsl(H) {
        let r = 0, g = 0, b = 0;
        if (H.length == 4) {
            r = "0x" + H[1] + H[1];
            g = "0x" + H[2] + H[2];
            b = "0x" + H[3] + H[3];
        } else if (H.length == 7) {
            r = "0x" + H[1] + H[2];
            g = "0x" + H[3] + H[4];
            b = "0x" + H[5] + H[6];
        }
        r /= 255;
        g /= 255;
        b /= 255;
        let cmin = Math.min(r,g,b),
            cmax = Math.max(r,g,b),
            delta = cmax - cmin,
            h = 0, s = 0, l = 0;

        if (delta == 0) h = 0;
        else if (cmax == r) h = ((g - b) / delta) % 6;
        else if (cmax == g) h = (b - r) / delta + 2;
        else h = (r - g) / delta + 4;

        h = Math.round(h * 60);
        if (h < 0) h += 360;
        l = (cmax + cmin) / 2;
        s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
        s = +(s * 100).toFixed(1);
        l = +(l * 100).toFixed(1);
        return [h, s, l];
    }

    function hslToHex(h, s, l) {
        s /= 100;
        l /= 100;
        let c = (1 - Math.abs(2 * l - 1)) * s,
            x = c * (1 - Math.abs((h / 60) % 2 - 1)),
            m = l - c/2,
            r = 0, g = 0, b = 0;

        if (0 <= h && h < 60) { r = c; g = x; b = 0; }
        else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
        else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
        else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
        else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
        else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
        
        r = Math.round((r + m) * 255).toString(16);
        g = Math.round((g + m) * 255).toString(16);
        b = Math.round((b + m) * 255).toString(16);

        if (r.length == 1) r = "0" + r;
        if (g.length == 1) g = "0" + g;
        if (b.length == 1) b = "0" + b;

        return "#" + r + g + b;
    }

    function generateHarmoniousPalette() {
        const baseHue = Math.random() * 360;
        const saturation = 50 + Math.random() * 50;
        const lightness = 60 + Math.random() * 20;
        const palette = [];

        // Analogous harmony: colors are next to each other on the color wheel
        const hueStep = 20 + Math.random() * 20; 
        for (let i = 0; i < 5; i++) {
            let currentHue = (baseHue + i * hueStep) % 360;
            let currentLightness = lightness - i * 5; // Vary lightness slightly
            palette.push(hslToHex(currentHue, saturation, currentLightness));
        }
        return palette;
    }

    // --- End of Color Logic ---

    const paletteContainer = document.getElementById('palette');
    const generateBtn = document.getElementById('generate-btn');

    let lockedColors = [false, false, false, false, false];
    let currentPalette = [];

    function getTextColor(hexColor) {
        const rgb = parseInt(hexColor.slice(1), 16);
        const r = (rgb >> 16) & 0xff;
        const g = (rgb >> 8) & 0xff;
        const b = (rgb >> 0) & 0xff;
        const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        return luma < 128 ? 'white' : 'black';
    }

    function createColorCard(color, index) {
        const card = document.createElement('div');
        card.classList.add('color-card');
        card.style.backgroundColor = color;
        card.dataset.color = color;
        card.dataset.index = index;

        const textColor = getTextColor(color);

        card.innerHTML = `
            <div class="color-info">
                <span class="color-hex font-semibold">${color.toUpperCase()}</span>
                <div class="card-controls">
                    <button class="copy-btn" title="Copy">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="lock-btn" title="Lock">
                        <i class="fas fa-unlock"></i>
                    </button>
                </div>
            </div>
            <div class="copy-tooltip">Copied!</div>
        `;
        
        // Adjust icon colors based on background
        card.querySelectorAll('.card-controls button i').forEach(icon => {
            icon.style.color = textColor === 'white' ? '#E2E8F0' : '#1E293B';
        });
        card.querySelector('.color-hex').style.color = textColor === 'white' ? '#E2E8F0' : '#1E293B';


        card.querySelector('.copy-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(color);
            const tooltip = card.querySelector('.copy-tooltip');
            tooltip.classList.add('show');
            setTimeout(() => tooltip.classList.remove('show'), 1500);
        });

        card.querySelector('.lock-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            const icon = card.querySelector('.lock-btn i');
            lockedColors[index] = !lockedColors[index];
            icon.classList.toggle('fa-unlock');
            icon.classList.toggle('fa-lock');
        });

        return card;
    }

    function generatePalette(isInitial = false) {
        const newHarmoniousPalette = generateHarmoniousPalette();
        
        if (isInitial) {
            paletteContainer.innerHTML = '';
            currentPalette = [];
        }

        for (let i = 0; i < 5; i++) {
            if (!lockedColors[i]) {
                const newColor = newHarmoniousPalette[i];
                if (isInitial) {
                    currentPalette.push(newColor);
                    const card = createColorCard(newColor, i);
                    paletteContainer.appendChild(card);
                } else {
                    currentPalette[i] = newColor;
                    const card = paletteContainer.children[i];
                    card.style.backgroundColor = newColor;
                    card.dataset.color = newColor;
                    card.querySelector('.color-hex').textContent = newColor.toUpperCase();
                     const textColor = getTextColor(newColor);
                    card.querySelectorAll('.card-controls button i').forEach(icon => {
                        icon.style.color = textColor === 'white' ? '#E2E8F0' : '#1E293B';
                    });
                    card.querySelector('.color-hex').style.color = textColor === 'white' ? '#E2E8F0' : '#1E293B';
                }
            }
        }
    }

    const copyAllBtn = document.getElementById('copy-all-btn');
    const savePaletteBtn = document.getElementById('save-palette-btn');
    const viewSavedBtn = document.getElementById('view-saved-btn');
    const savedPalettesModal = document.getElementById('saved-palettes-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const savedPalettesContainer = document.getElementById('saved-palettes-container');

    generateBtn.addEventListener('click', () => generatePalette(false));
    document.body.addEventListener('keyup', (e) => {
        if (e.key === ' ' && document.activeElement.tagName.toLowerCase() !== 'button') {
            generatePalette(false);
        }
    });

    copyAllBtn.addEventListener('click', () => {
        const allColors = currentPalette.join(', ');
        navigator.clipboard.writeText(allColors);
    });

    savePaletteBtn.addEventListener('click', () => {
        const savedPalettes = JSON.parse(localStorage.getItem('chromify_palettes') || '[]');
        savedPalettes.push(currentPalette);
        localStorage.setItem('chromify_palettes', JSON.stringify(savedPalettes));
    });

    function displaySavedPalettes() {
        savedPalettesContainer.innerHTML = '';
        const savedPalettes = JSON.parse(localStorage.getItem('chromify_palettes') || '[]');
        savedPalettes.forEach((palette, index) => {
            const paletteDiv = document.createElement('div');
            paletteDiv.classList.add('flex', 'items-center', 'justify-between', 'p-3', 'rounded-lg', 'glass-container', 'mb-2');
            
            const colorsDiv = document.createElement('div');
            colorsDiv.classList.add('flex', 'gap-2');
            palette.forEach(color => {
                const colorDot = document.createElement('div');
                colorDot.classList.add('h-8', 'w-8', 'rounded-full', 'border-2', 'border-gray-500');
                colorDot.style.backgroundColor = color;
                colorsDiv.appendChild(colorDot);
            });

            const buttonsDiv = document.createElement('div');
            buttonsDiv.classList.add('flex', 'gap-2');

            const loadBtn = document.createElement('button');
            loadBtn.innerHTML = '<i class="fas fa-upload"></i>';
            loadBtn.classList.add('btn-secondary');
            loadBtn.addEventListener('click', () => {
                currentPalette = [...palette];
                lockedColors = [false, false, false, false, false];
                paletteContainer.innerHTML = '';
                currentPalette.forEach((color, i) => {
                    const card = createColorCard(color, i);
                    paletteContainer.appendChild(card);
                });
                savedPalettesModal.classList.add('hidden');
            });

            const removeBtn = document.createElement('button');
            removeBtn.innerHTML = '<i class="fas fa-trash"></i>';
            removeBtn.classList.add('btn-secondary');
            removeBtn.addEventListener('click', () => {
                savedPalettes.splice(index, 1);
                localStorage.setItem('chromify_palettes', JSON.stringify(savedPalettes));
                displaySavedPalettes();
            });

            buttonsDiv.appendChild(loadBtn);
            buttonsDiv.appendChild(removeBtn);
            paletteDiv.appendChild(colorsDiv);
            paletteDiv.appendChild(buttonsDiv);
            savedPalettesContainer.appendChild(paletteDiv);
        });
    }

    viewSavedBtn.addEventListener('click', () => {
        displaySavedPalettes();
        savedPalettesModal.classList.remove('hidden');
    });

    closeModalBtn.addEventListener('click', () => {
        savedPalettesModal.classList.add('hidden');
    });

    generatePalette(true);
});