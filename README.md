# 🖼️ Image Converter - WebP

A modern, pure frontend web application that converts PNG/JPG images to WebP format with advanced compression and batch processing capabilities.

## ✨ Features

### Core Functionality
- **Batch Processing**: Convert up to 100 images simultaneously
- **WebP Format**: Support for WebP output format
- **Drag & Drop**: Intuitive file upload with drag and drop support
- **Quality Control**: Adjustable quality settings (0.1 - 1.0)
- **Image Resizing**: Optional width/height constraints with aspect ratio preservation
- **Batch Renaming**: Custom file prefix for organized output

### User Experience
- **Modern UI**: Clean, responsive design with dark/light mode toggle
- **Progress Tracking**: Real-time progress bar for batch conversions
- **File Size Comparison**: Shows original vs converted file sizes and savings percentage
- **Individual Downloads**: Download single files or all as ZIP
- **Settings Persistence**: Remembers your last used settings via localStorage

### Advanced Features
- **Web Workers**: Non-blocking image processing for smooth UI
- **Chunked Processing**: Processes images in batches to prevent browser freezing
- **PWA Support**: Installable as a Progressive Web App for offline use
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Accessibility**: Keyboard navigation and screen reader support

## 🚀 Quick Start

1. **Download the files** to your local machine
2. **Open `index.html`** in a modern web browser
3. **Upload images** by dragging and dropping or clicking the upload area
4. **Configure settings** (quality, format, resize options)
5. **Click "Convert Images"** to start processing
6. **Download results** individually or as a ZIP file

## 📁 Project Structure

```
image-converter/
├── index.html          # Main HTML file
├── style.css           # Styles and theming
├── script.js           # Main application logic
├── manifest.json       # PWA manifest
├── sw.js              # Service worker for PWA
└── README.md          # This file
```

## 🛠️ Technical Details

### Browser Support
- **Modern browsers** with WebP/AVIF support
- **Chrome 85+**, **Firefox 80+**, **Safari 14+**, **Edge 85+**
- **Mobile browsers** with canvas support

### Dependencies
- **JSZip** (CDN): For creating ZIP archives
- **FileSaver.js** (CDN): For file download functionality
- **Vanilla JavaScript**: No frameworks required

### Performance Optimizations
- **Web Workers**: Image processing in background threads
- **Chunked Processing**: 10 images at a time to prevent UI blocking
- **Canvas Optimization**: Efficient image manipulation
- **Memory Management**: Proper cleanup of object URLs

## 🎨 Customization

### Quality Presets
- **High (90%)**: Best quality, larger file size
- **Balanced (80%)**: Good balance of quality and size
- **Small (60%)**: Smaller file size, acceptable quality

### Output Format
- **WebP**: Google's modern image format with excellent compression

### Resize Options
- **Max Width**: Constrain image width
- **Max Height**: Constrain image height
- **Aspect Ratio**: Maintain original proportions

## 📱 PWA Features

### Installation
- **Desktop**: Click the install button in the browser address bar
- **Mobile**: Add to home screen from browser menu
- **Offline**: Works without internet connection after first load

### Service Worker
- **Caching**: Stores app resources for offline use
- **Background Sync**: Handles offline operations
- **Push Notifications**: Notify users of conversion completion

## 🔧 Configuration

### Settings Storage
All user preferences are stored in `localStorage`:
```javascript
{
  quality: 0.8,
  format: 'webp',
  maxWidth: '',
  maxHeight: '',
  maintainAspectRatio: true,
  filePrefix: 'converted_',
  theme: 'light'
}
```

### Customization Options
- **Theme**: Light/dark mode with system preference detection
- **File Prefix**: Custom naming for converted files
- **Quality Slider**: Fine-tune compression settings
- **Format Selection**: WebP format (optimized for web)

## 🚨 Limitations

### Browser Support
- **WebP**: Widely supported in modern browsers
- **Canvas**: Required for image processing

### File Size Limits
- **Maximum files**: 100 images per batch
- **Individual file size**: Limited by browser memory
- **Total batch size**: Limited by available RAM

### Performance
- **Large images**: May slow down processing
- **Many files**: Processing time increases linearly
- **Mobile devices**: May have memory constraints

## 🐛 Troubleshooting

### Common Issues

**Images not converting:**
- Check browser support for WebP/AVIF
- Ensure images are valid PNG/JPG files
- Try reducing batch size

**Slow performance:**
- Reduce quality settings
- Process fewer images at once
- Close other browser tabs

**Download issues:**
- Check browser download settings
- Ensure sufficient disk space
- Try individual downloads instead of ZIP

### Browser Compatibility
- **Chrome**: Full support for all features
- **Firefox**: Full support for WebP
- **Safari**: WebP support
- **Edge**: Full support for all features

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

### Development Setup
1. Clone the repository
2. Open `index.html` in a local server
3. Make your changes
4. Test thoroughly across different browsers
5. Submit a pull request

## 📞 Support

If you encounter any issues or have questions:
- Check the troubleshooting section above
- Review browser compatibility requirements
- Ensure you're using a supported browser version
- Try clearing browser cache and localStorage

---

**Built with ❤️ - No data leaves your device**
