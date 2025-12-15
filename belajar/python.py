import os
import time
import random
from colorama import init, Fore, Back, Style

# Inisialisasi colorama untuk warna di Windows
init(autoreset=True)

def bersihkan_layar():
    """Membersihkan layar terminal"""
    os.system('cls' if os.name == 'nt' else 'clear')

def tampilkan_pohon(tinggi=10, dengan_dekorasi=True):
    """Menampilkan pohon natal dengan tinggi tertentu"""
    # Variasi warna untuk dekorasi
    warna_dekorasi = [Fore.RED, Fore.YELLOW, Fore.CYAN, Fore.MAGENTA, Fore.BLUE]
    
    # Tampilkan setiap baris pohon
    for i in range(tinggi):
        # Hitung jumlah bintang dan spasi
        spasi = ' ' * (tinggi - i - 1)
        daun = '*' * (2 * i + 1)
        
        # Buat baris dengan dekorasi acak
        baris = spasi
        for char in daun:
            if dengan_dekorasi and random.random() > 0.7 and char == '*':
                warna = random.choice(warna_dekorasi)
                baris += warna + 'o' + Style.RESET_ALL
            else:
                baris += Fore.GREEN + char + Style.RESET_ALL
        
        print(baris)
    
    # Tampilkan batang pohon
    batang_spasi = ' ' * (tinggi - 2)
    batang = Fore.YELLOW + batang_spasi + '|||' + Style.RESET_ALL
    print(batang)
    print(batang)

def tampilkan_hiasan_bawah(lebar):
    """Menampilkan hiasan di bawah pohon"""
    warna = [Fore.RED, Fore.GREEN, Fore.YELLOW, Fore.CYAN, Fore.MAGENTA, Fore.BLUE]
    
    # Hadiah di bawah pohon
    hadiah = [
        Fore.RED + "[___]" + Style.RESET_ALL,
        Fore.GREEN + "[/_\]" + Style.RESET_ALL,
        Fore.BLUE + "{@@@}" + Style.RESET_ALL,
        Fore.CYAN + "<###>" + Style.RESET_ALL,
    ]
    
    # Susunan hadiah
    baris_hadiah = '   ' + '  '.join(hadiah)
    print(baris_hadiah)
    
    # Hiasan tanah
    tanah = ' ' * 5
    for _ in range(lebar // 2):
        tanah += random.choice(warna) + '~' + Style.RESET_ALL
    print(tanah)

def tampilkan_pesan_natal():
    """Menampilkan pesan Natal"""
    pesan = [
        " " * 15 + Fore.RED + "🎄" + Fore.GREEN + " SELAMAT NATAL " + Fore.RED + "🎄" + Style.RESET_ALL,
        " " * 18 + Fore.YELLOW + "2025" + Style.RESET_ALL,
        " " * 10 + Fore.CYAN + "Semoga Damai Natal Bersamamu!" + Style.RESET_ALL
    ]
    
    for p in pesan:
        print(p)

def animasi_kedip(tinggi_pohon=12, iterasi=10):
    """Menampilkan animasi pohon natal berkedip"""
    for i in range(iterasi):
        bersihkan_layar()
        print("\n" * 2)
        
        # Tampilkan bintang di atas pohon
        print(" " * (tinggi_pohon) + Fore.YELLOW + "★" + Style.RESET_ALL)
        
        # Tampilkan pohon dengan atau tanpa dekorasi (untuk efek kedip)
        dengan_dekorasi = i % 2 == 0
        tampilkan_pohon(tinggi_pohon, dengan_dekorasi)
        
        # Tampilkan hiasan bawah
        tampilkan_hiasan_bawah(tinggi_pohon * 2)
        
        # Tampilkan pesan natal
        print("\n")
        tampilkan_pesan_natal()
        
        # Delay untuk animasi
        time.sleep(0.5)

def main():
    """Fungsi utama program"""
    print("Mempersiapkan pohon Natal...")
    time.sleep(1)
    
    # Tampilkan animasi kedip
    animasi_kedip(tinggi_pohon=12, iterasi=10)
    
    # Tampilkan pohon final
    bersihkan_layar()
    print("\n" * 2)
    print(" " * 12 + Fore.YELLOW + "★" + Style.RESET_ALL)
    tampilkan_pohon(tinggi=12, dengan_dekorasi=True)
    tampilkan_hiasan_bawah(24)
    
    # Pesan akhir
    print("\n")
    print(" " * 8 + Fore.RED + "=" * 30 + Style.RESET_ALL)
    tampilkan_pesan_natal()
    print(" " * 8 + Fore.RED + "=" * 30 + Style.RESET_ALL)
    
    # Tampilkan instruksi
    print("\n" + Fore.CYAN + "Tekan Enter untuk keluar..." + Style.RESET_ALL)
    input()

if __name__ == "__main__":
    # Jika modul colorama tidak tersedia, beri pesan
    try:
        main()
    except ImportError:
        print("Modul 'colorama' diperlukan untuk program ini.")
        print("Instal dengan: pip install colorama")
        print("\nBerikut pohon natal sederhana tanpa warna:")
        print("""
              ★
             ***
            *****
           *******
          *********
         ***********
        *************
       ***************
      *****************
     *******************
             |||
             |||
        """)