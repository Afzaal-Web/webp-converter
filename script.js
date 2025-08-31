// Image Converter App - Main JavaScript
class ImageConverter {
    constructor() {
        this.files = [];
        this.convertedFiles = [];
        this.worker = null;
        this.settings = this.loadSettings();
        this.isConverting = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.applySettings();
        this.setupTheme();
    }

    // Event Listeners Setup
    setupEventListeners() {
        // File input
        const fileInput = document.getElementById('fileInput');
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e.target.files));

        // Choose files button
        const chooseFilesBtn = document.getElementById('chooseFilesBtn');
        chooseFilesBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event bubbling to upload area
            fileInput.click();
        });

        // Upload area drag & drop
        const uploadArea = document.getElementById('uploadArea');
        uploadArea.addEventListener('click', (e) => {
            // Only trigger file input if clicking on the upload area itself, not on buttons
            if (e.target === uploadArea || e.target.classList.contains('upload-content') || e.target.classList.contains('upload-icon')) {
                fileInput.click();
            }
        });
        uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        uploadArea.addEventListener('drop', (e) => this.handleDrop(e));

        // Controls
        document.getElementById('qualitySlider').addEventListener('input', (e) => {
            document.getElementById('qualityValue').textContent = `${Math.round(e.target.value * 100)}%`;
            this.saveSettings();
        });

        // Quality presets
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const quality = parseFloat(e.target.dataset.quality);
                document.getElementById('qualitySlider').value = quality;
                document.getElementById('qualityValue').textContent = `${Math.round(quality * 100)}%`;
                this.updatePresetButtons(e.target);
                this.saveSettings();
            });
        });

        // Convert button
        document.getElementById('convertBtn').addEventListener('click', () => this.convertImages());

        // Download all button
        document.getElementById('downloadAllBtn').addEventListener('click', () => this.downloadAllAsZip());

        // Theme toggle
        document.getElementById('darkModeToggle').addEventListener('click', () => this.toggleTheme());

        // Settings inputs
        ['maxWidth', 'maxHeight', 'maintainAspectRatio', 'filePrefix'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.saveSettings());
                element.addEventListener('input', () => this.saveSettings());
            }
        });
    }

    // File Handling
    handleFileSelect(fileList) {
        this.addFiles(Array.from(fileList));
    }

    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files);
        this.addFiles(files);
    }

    addFiles(newFiles) {
        const imageFiles = newFiles.filter(file => 
            file.type.startsWith('image/') && 
            ['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)
        );

        if (this.files.length + imageFiles.length > 100) {
            this.showError('Maximum 100 images allowed');
            return;
        }

        this.files.push(...imageFiles);
        this.updateUI();
    }

    // UI Updates
    updateUI() {
        const controlsSection = document.getElementById('controlsSection');
        const resultsSection = document.getElementById('resultsSection');
        
        if (this.files.length > 0) {
            controlsSection.style.display = 'block';
            resultsSection.style.display = 'none';
            this.convertedFiles = [];
        } else {
            controlsSection.style.display = 'none';
            resultsSection.style.display = 'none';
        }

        document.getElementById('downloadAllBtn').disabled = this.convertedFiles.length === 0;
    }

    updatePresetButtons(activeBtn) {
        document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
        activeBtn.classList.add('active');
    }

    // Image Conversion
    async convertImages() {
        if (this.isConverting || this.files.length === 0) return;

        this.isConverting = true;
        this.convertedFiles = [];
        
        // Show progress
        document.getElementById('progressSection').style.display = 'block';
        document.getElementById('convertBtn').disabled = true;
        
        const quality = parseFloat(document.getElementById('qualitySlider').value);
        const format = 'webp'; // Fixed to WebP
        const maxWidth = parseInt(document.getElementById('maxWidth').value) || null;
        const maxHeight = parseInt(document.getElementById('maxHeight').value) || null;
        const maintainAspectRatio = document.getElementById('maintainAspectRatio').checked;
        const filePrefix = document.getElementById('filePrefix').value;

        // Process in chunks
        const chunkSize = 10;
        const totalFiles = this.files.length;
        let processed = 0;

        for (let i = 0; i < totalFiles; i += chunkSize) {
            const chunk = this.files.slice(i, i + chunkSize);
            
            await Promise.all(chunk.map(async (file, index) => {
                try {
                    const result = await this.convertSingleImage(file, quality, format, maxWidth, maxHeight, maintainAspectRatio, filePrefix);
                    this.convertedFiles.push(result);
                    processed++;
                    this.updateProgress(processed, totalFiles);
                } catch (error) {
                    console.error('Conversion error:', error);
                    this.showError(`Failed to convert ${file.name}: ${error.message}`);
                }
            }));

            // Small delay to prevent UI freezing
            await new Promise(resolve => setTimeout(resolve, 10));
        }

        this.isConverting = false;
        document.getElementById('progressSection').style.display = 'none';
        document.getElementById('convertBtn').disabled = false;
        
        this.displayResults();
    }

    async convertSingleImage(file, quality, format, maxWidth, maxHeight, maintainAspectRatio, filePrefix) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                // Create canvas
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Set canvas size
                let { width, height } = this.calculateNewDimensions(
                    img.width, img.height, maxWidth, maxHeight, maintainAspectRatio
                );
                
                canvas.width = width;
                canvas.height = height;
                
                // Draw and convert
                ctx.drawImage(img, 0, 0, width, height);
                
                const mimeType = 'image/webp';
                const extension = 'webp';
                
                canvas.toBlob((blob) => {
                    if (blob) {
                        const fileName = `${filePrefix}${this.getFileNameWithoutExtension(file.name)}.${extension}`;
                        resolve({
                            originalFile: file,
                            convertedBlob: blob,
                            fileName: fileName,
                            originalSize: file.size,
                            convertedSize: blob.size,
                            preview: canvas.toDataURL('image/jpeg', 0.8)
                        });
                    } else {
                        reject(new Error('Failed to convert image'));
                    }
                }, mimeType, quality);
            };
            
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = URL.createObjectURL(file);
        });
    }

    calculateNewDimensions(originalWidth, originalHeight, maxWidth, maxHeight, maintainAspectRatio) {
        let newWidth = originalWidth;
        let newHeight = originalHeight;
        
        if (maintainAspectRatio) {
            const aspectRatio = originalWidth / originalHeight;
            
            if (maxWidth && maxHeight) {
                if (maxWidth / aspectRatio <= maxHeight) {
                    newWidth = maxWidth;
                    newHeight = maxWidth / aspectRatio;
                } else {
                    newHeight = maxHeight;
                    newWidth = maxHeight * aspectRatio;
                }
            } else if (maxWidth) {
                newWidth = maxWidth;
                newHeight = maxWidth / aspectRatio;
            } else if (maxHeight) {
                newHeight = maxHeight;
                newWidth = maxHeight * aspectRatio;
            }
        } else {
            if (maxWidth) newWidth = maxWidth;
            if (maxHeight) newHeight = maxHeight;
        }
        
        return { width: Math.round(newWidth), height: Math.round(newHeight) };
    }

    getFileNameWithoutExtension(filename) {
        return filename.replace(/\.[^/.]+$/, '');
    }

    updateProgress(current, total) {
        const percentage = (current / total) * 100;
        document.getElementById('progressFill').style.width = `${percentage}%`;
        document.getElementById('progressCount').textContent = `${current} / ${total}`;
    }

    // Results Display
    displayResults() {
        const resultsSection = document.getElementById('resultsSection');
        const resultsGrid = document.getElementById('resultsGrid');
        
        resultsSection.style.display = 'block';
        resultsGrid.innerHTML = '';

        this.convertedFiles.forEach((result, index) => {
            const card = this.createResultCard(result, index);
            resultsGrid.appendChild(card);
        });

        this.updateSummary();
        document.getElementById('downloadAllBtn').disabled = false;
    }

    createResultCard(result, index) {
        const card = document.createElement('div');
        card.className = 'result-card';
        
        const savedPercent = ((result.originalSize - result.convertedSize) / result.originalSize * 100).toFixed(1);
        
        card.innerHTML = `
            <img src="${result.preview}" alt="Converted image" class="result-preview">
            <div class="result-info">
                <h4>${result.fileName}</h4>
                <div class="file-stats">
                    <span>Original: ${this.formatFileSize(result.originalSize)}</span>
                    <span>Converted: ${this.formatFileSize(result.convertedSize)}</span>
                </div>
                <div class="file-stats">
                    <span class="size-saved">Saved ${savedPercent}%</span>
                </div>
            </div>
            <div class="result-actions">
                <button class="download-btn" onclick="app.downloadSingleFile(${index})">
                    Download
                </button>
            </div>
        `;
        
        return card;
    }

    updateSummary() {
        const totalOriginal = this.convertedFiles.reduce((sum, file) => sum + file.originalSize, 0);
        const totalConverted = this.convertedFiles.reduce((sum, file) => sum + file.convertedSize, 0);
        const totalSaved = ((totalOriginal - totalConverted) / totalOriginal * 100).toFixed(1);

        document.getElementById('totalOriginal').textContent = this.formatFileSize(totalOriginal);
        document.getElementById('totalConverted').textContent = this.formatFileSize(totalConverted);
        document.getElementById('totalSaved').textContent = `${totalSaved}%`;
    }

    // Download Functions
    downloadSingleFile(index) {
        const result = this.convertedFiles[index];
        const url = URL.createObjectURL(result.convertedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async downloadAllAsZip() {
        if (this.convertedFiles.length === 0) return;

        const zip = new JSZip();
        
        this.convertedFiles.forEach(result => {
            zip.file(result.fileName, result.convertedBlob);
        });

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        saveAs(zipBlob, 'converted_images.zip');
    }

    // Utility Functions
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showError(message) {
        // Simple error display - you could enhance this with a toast notification
        alert(message);
    }

    // Settings Management
    loadSettings() {
        const defaultSettings = {
            quality: 0.8,
            format: 'webp',
            maxWidth: '',
            maxHeight: '',
            maintainAspectRatio: true,
            filePrefix: 'converted_',
            theme: 'dark'
        };

        try {
            const saved = localStorage.getItem('imageConverterSettings');
            return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        } catch (error) {
            console.error('Failed to load settings:', error);
            return defaultSettings;
        }
    }

    saveSettings() {
        const settings = {
            quality: parseFloat(document.getElementById('qualitySlider').value),
            format: 'webp', // Fixed to WebP
            maxWidth: document.getElementById('maxWidth').value,
            maxHeight: document.getElementById('maxHeight').value,
            maintainAspectRatio: document.getElementById('maintainAspectRatio').checked,
            filePrefix: document.getElementById('filePrefix').value,
            theme: document.documentElement.getAttribute('data-theme') || 'light'
        };

        try {
            localStorage.setItem('imageConverterSettings', JSON.stringify(settings));
            this.settings = settings;
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }

    applySettings() {
        document.getElementById('qualitySlider').value = this.settings.quality;
        document.getElementById('qualityValue').textContent = `${Math.round(this.settings.quality * 100)}%`;
        document.getElementById('maxWidth').value = this.settings.maxWidth;
        document.getElementById('maxHeight').value = this.settings.maxHeight;
        document.getElementById('maintainAspectRatio').checked = this.settings.maintainAspectRatio;
        document.getElementById('filePrefix').value = this.settings.filePrefix;

        // Update preset button
        const presetBtn = document.querySelector(`[data-quality="${this.settings.quality}"]`);
        if (presetBtn) {
            this.updatePresetButtons(presetBtn);
        }

        // Apply theme
        document.documentElement.setAttribute('data-theme', this.settings.theme);
    }

    // Theme Management
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        this.settings.theme = newTheme;
        this.saveSettings();
    }

    setupTheme() {
        // Default to dark mode
        if (!this.settings.theme) {
            document.documentElement.setAttribute('data-theme', 'dark');
            this.settings.theme = 'dark';
        }
    }


}

// Initialize the app
const app = new ImageConverter();


