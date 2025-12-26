#!/usr/bin/env python3
"""
Script to create simple PWA icon PNG files
"""
try:
    from PIL import Image, ImageDraw, ImageFont
    import os
    
    def create_icon(size, output_path):
        # Create image with blue background
        img = Image.new('RGB', (size, size), color='#3b82f6')
        draw = ImageDraw.Draw(img)
        
        # Draw rounded rectangle
        corner_radius = int(size * 0.15)
        draw.rounded_rectangle([(0, 0), (size, size)], radius=corner_radius, fill='#3b82f6')
        
        # Try to draw emoji (may not work on all systems)
        try:
            # Use a large font
            font_size = int(size * 0.4)
            # For emoji, we'll use a simple approach
            # Draw a circle as placeholder
            center = size // 2
            radius = int(size * 0.3)
            draw.ellipse([center - radius, center - radius, center + radius, center + radius], 
                        fill='white', outline='white', width=2)
        except:
            pass
        
        # Save image
        img.save(output_path, 'PNG')
        print(f"Created {output_path}")
    
    # Create icons
    public_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'public')
    os.makedirs(public_dir, exist_ok=True)
    
    create_icon(192, os.path.join(public_dir, 'pwa-192x192.png'))
    create_icon(512, os.path.join(public_dir, 'pwa-512x512.png'))
    
    print("PWA icons created successfully!")
    
except ImportError:
    print("PIL (Pillow) not installed. Creating simple placeholder files...")
    # Create minimal valid PNG files
    import struct
    import zlib
    
    def create_minimal_png(size, output_path):
        # Minimal valid PNG: 1x1 pixel, blue
        # PNG signature
        png = b'\x89PNG\r\n\x1a\n'
        
        # IHDR chunk
        width = struct.pack('>I', size)
        height = struct.pack('>I', size)
        ihdr_data = width + height + b'\x08\x02\x00\x00\x00'  # 8-bit RGB, no compression
        ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data) & 0xffffffff
        ihdr_chunk = struct.pack('>I', len(ihdr_data)) + b'IHDR' + ihdr_data + struct.pack('>I', ihdr_crc)
        png += ihdr_chunk
        
        # IDAT chunk (minimal data)
        # For simplicity, create a blue pixel repeated
        pixel_data = b'\x3b\x82\xf6' * (size * size)  # Blue color
        compressed = zlib.compress(pixel_data)
        idat_crc = zlib.crc32(b'IDAT' + compressed) & 0xffffffff
        idat_chunk = struct.pack('>I', len(compressed)) + b'IDAT' + compressed + struct.pack('>I', idat_crc)
        png += idat_chunk
        
        # IEND chunk
        iend_crc = zlib.crc32(b'IEND') & 0xffffffff
        iend_chunk = struct.pack('>I', 0) + b'IEND' + struct.pack('>I', iend_crc)
        png += iend_chunk
        
        with open(output_path, 'wb') as f:
            f.write(png)
        print(f"Created minimal {output_path}")
    
    import os
    public_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'public')
    os.makedirs(public_dir, exist_ok=True)
    
    create_minimal_png(192, os.path.join(public_dir, 'pwa-192x192.png'))
    create_minimal_png(512, os.path.join(public_dir, 'pwa-512x512.png'))
    
    print("Minimal PWA icons created!")

