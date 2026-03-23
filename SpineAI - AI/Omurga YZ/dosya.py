import os


def etiketleri_sifirla(klasor_yolu):

    dosyalar = [f for f in os.listdir(klasor_yolu) if f.endswith('.txt')]
    degisen_dosya = 0

    for dosya in dosyalar:
        dosya_path = os.path.join(klasor_yolu, dosya)

        with open(dosya_path, 'r') as f:
            satirlar = f.readlines()

        yeni_satirlar = []
        for satir in satirlar:
            parcalar = satir.strip().split()
            if len(parcalar) > 0:

                parcalar[0] = "0"
                yeni_satirlar.append(" ".join(parcalar) + "\n")

      
        with open(dosya_path, 'w') as f:
            f.writelines(yeni_satirlar)
            degisen_dosya += 1

    print(f"Bitti! {klasor_yolu} içindeki {degisen_dosya} dosyanın tüm sınıfları '0' yapıldı.")



print("Train etiketleri düzeltiliyor...")
etiketleri_sifirla(r"C:\Users\kenan\Desktop\Multimodel\train\labels")

print("Valid etiketleri düzeltiliyor...")
etiketleri_sifirla(r"C:\Users\kenan\Desktop\Multimodel\valid\labels")

print("Test etiketleri düzeltiliyor...")
etiketleri_sifirla(r"C:\Users\kenan\Desktop\Multimodel\test\labels")
