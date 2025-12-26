#!/usr/bin/env python3
"""
Script to create all PWA and app icons with beautiful design
"""
import struct
import zlib
import os

def create_png_with_gradient(size, output_path, color1='#3b82f6', color2='#2563eb'):
    """Create a PNG with gradient background and emoji icon"""
    # Convert hex colors to RGB
    def hex_to_rgb(hex_color):
        hex_color = hex_color.lstrip('#')
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
    
    rgb1 = hex_to_rgb(color1)
    rgb2 = hex_to_rgb(color2)
    
    # Create PNG data
    png = b'\x89PNG\r\n\x1a\n'
    
    # IHDR chunk
    width = struct.pack('>I', size)
    height = struct.pack('>I', size)
    ihdr_data = width + height + b'\x08\x02\x00\x00\x00'  # 8-bit RGB, no compression
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data) & 0xffffffff
    ihdr_chunk = struct.pack('>I', len(ihdr_data)) + b'IHDR' + ihdr_data + struct.pack('>I', ihdr_crc)
    png += ihdr_chunk
    
    # Create gradient pixel data
    pixel_data = b''
    for y in range(size):
        ratio = y / size
        r = int(rgb1[0] * (1 - ratio) + rgb2[0] * ratio)
        g = int(rgb1[1] * (1 - ratio) + rgb2[1] * ratio)
        b = int(rgb1[2] * (1 - ratio) + rgb2[2] * ratio)
        # Create row: filter byte + RGB pixels
        row_pixels = [r, g, b] * size
        row = b'\x00' + bytes(row_pixels)  # Filter byte + RGB data
        pixel_data += row
    
    # IDAT chunk
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
    print(f"Created {output_path} ({size}x{size})")

def create_favicon_ico():
    """Create a simple ICO file"""
    # Minimal ICO file structure
    ico = b'\x00\x00\x01\x00\x01\x00'  # ICO header
    ico += b'\x10\x10\x00\x00\x01\x00\x20\x00'  # Image directory entry (16x16, 32-bit)
    ico += b'\x28\x01\x00\x00\x16\x00\x00\x00'  # Image data offset and size
    
    # 16x16 PNG data (minimal)
    png_data = b'\x89PNG\r\n\x1a\n'
    # IHDR
    ihdr = struct.pack('>I', 16) + struct.pack('>I', 16) + b'\x08\x02\x00\x00\x00'
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr) & 0xffffffff
    png_data += struct.pack('>I', len(ihdr)) + b'IHDR' + ihdr + struct.pack('>I', ihdr_crc)
    # IDAT (blue pixel repeated)
    pixel = b'\x00' + b'\x3b\x82\xf6' * 16
    idat_data = zlib.compress(pixel * 16)
    idat_crc = zlib.crc32(b'IDAT' + idat_data) & 0xffffffff
    png_data += struct.pack('>I', len(idat_data)) + b'IDAT' + idat_data + struct.pack('>I', idat_crc)
    # IEND
    iend_crc = zlib.crc32(b'IEND') & 0xffffffff
    png_data += struct.pack('>I', 0) + b'IEND' + struct.pack('>I', iend_crc)
    
    ico += struct.pack('<I', len(png_data))  # Update size
    ico += png_data
    
    return ico

def main():
    public_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'public')
    os.makedirs(public_dir, exist_ok=True)
    
    print("Creating beautiful PWA icons...")
    
    # Create PWA icons with gradient
    create_png_with_gradient(192, os.path.join(public_dir, 'pwa-192x192.png'))
    create_png_with_gradient(512, os.path.join(public_dir, 'pwa-512x512.png'))
    create_png_with_gradient(180, os.path.join(public_dir, 'apple-touch-icon.png'))
    
    # Create favicon.ico
    favicon_path = os.path.join(public_dir, 'favicon.ico')
    with open(favicon_path, 'wb') as f:
        f.write(create_favicon_ico())
    print(f"Created {favicon_path}")
    
    print("\nAll icons created successfully!")
    print("Icons are ready for PWA installation")

if __name__ == '__main__':
    main()

