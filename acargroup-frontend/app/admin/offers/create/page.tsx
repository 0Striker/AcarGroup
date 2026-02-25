"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getToken } from "@/lib/auth";
import { Plus, Trash2, Save, FileDown, ArrowLeft, Search } from "lucide-react";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

type Product = {
    id: number;
    name: string;
    price: number;
};

type OfferItem = {
    productId?: number;
    productName: string;
    description?: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
};

type BankAccount = {
    iban: string;
    bankName: string;
};

function OfferCreateContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const isEdit = !!id;

    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);

    // Form State
    const [customerName, setCustomerName] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [customerAddress, setCustomerAddress] = useState("");

    const [offerDate, setOfferDate] = useState(new Date().toISOString().split("T")[0]);
    const [validUntil, setValidUntil] = useState(
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    );

    const [currency, setCurrency] = useState("USD");
    const [exchangeRate, setExchangeRate] = useState(1.0);
    const [taxRate, setTaxRate] = useState(20);
    const [notes, setNotes] = useState("Fiyatlarımıza KDV (%20) dahildir.\nTeklifimiz peşin ödeme esasına göre hazırlanmıştır.\nÖdemenin %50'si peşin %50'si iş bitiminde teslim alınır.\nYasal sorumlulukların hepsini kapsayan kurulumdur.");
    const [generalConditions, setGeneralConditions] = useState("");
    const [selectedTemplate, setSelectedTemplate] = useState("standard"); // 'standard', 'corporate-a', 'corporate-b'

    const [items, setItems] = useState<OfferItem[]>([]);

    // New Fields
    const [deliveryTime, setDeliveryTime] = useState("");
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([{ bankName: "", iban: "" }]);

    // Product Search
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<Product[]>([]);

    useEffect(() => {
        fetchProducts();
        if (isEdit) {
            fetchOffer(Number(id));
        }
    }, [id]);

    const fetchProducts = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/products`);
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchOffer = async (offerId: number) => {
        try {
            const token = getToken();
            const res = await fetch(`${API_BASE_URL}/api/offers/${offerId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setCustomerName(data.customerName);
                setCustomerEmail(data.customerEmail || "");
                setCustomerPhone(data.customerPhone || "");
                setCustomerAddress(data.customerAddress || "");
                setOfferDate(data.offerDate.split("T")[0]);
                setValidUntil(data.validUntil.split("T")[0]);
                setCurrency(data.currency);
                setExchangeRate(data.exchangeRate);
                setTaxRate(data.taxRate);
                setNotes(data.notes || "");
                setItems(data.items);
                setDeliveryTime(data.deliveryTime || "");
                if (data.bankDetails) {
                    try {
                        const parsed = JSON.parse(data.bankDetails);
                        if (Array.isArray(parsed)) setBankAccounts(parsed);
                    } catch (e) {
                        // Fallback if not JSON
                        setBankAccounts([{ bankName: "Detaylar", iban: data.bankDetails }]);
                    }
                }
                // If we saved template in backend logic later, we would load it here. 
                // For now default to standard or add it to backend if needed.
            }
        } catch (error) {
            console.error(error);
            toast.error("Teklif yüklenemedi.");
        }
    };

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        if (term.length > 1) {
            const results = products.filter((p) =>
                p.name.toLowerCase().includes(term.toLowerCase())
            );
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    };

    const addProduct = (product: Product) => {
        const newItem: OfferItem = {
            productId: product.id,
            productName: product.name,
            quantity: 1,
            unit: "Adet",
            unitPrice: product.price,
            totalPrice: product.price,
        };
        setItems([...items, newItem]);
        setSearchTerm("");
        setSearchResults([]);
    };

    const addCustomItem = () => {
        const newItem: OfferItem = {
            productName: "Yeni Ürün / Hizmet",
            quantity: 1,
            unit: "Adet",
            unitPrice: 0,
            totalPrice: 0,
        };
        setItems([...items, newItem]);
    };

    const updateItem = (index: number, field: keyof OfferItem, value: any) => {
        const newItems = [...items];
        const item = { ...newItems[index], [field]: value };

        if (field === "quantity" || field === "unitPrice") {
            item.totalPrice = item.quantity * item.unitPrice;
        }

        newItems[index] = item;
        setItems(newItems);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const addBankAccount = () => {
        setBankAccounts([...bankAccounts, { bankName: "", iban: "" }]);
    };

    const removeBankAccount = (index: number) => {
        setBankAccounts(bankAccounts.filter((_, i) => i !== index));
    };

    const updateBankAccount = (index: number, field: keyof BankAccount, value: string) => {
        const newAccounts = [...bankAccounts];
        newAccounts[index] = { ...newAccounts[index], [field]: value };
        setBankAccounts(newAccounts);
    };

    const calculateTotals = () => {
        const subTotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
        const taxAmount = subTotal * (taxRate / 100);
        const grandTotal = subTotal + taxAmount;
        return { subTotal, taxAmount, grandTotal };
    };

    const { subTotal, taxAmount, grandTotal } = calculateTotals();

    const handleSave = async () => {
        if (!customerName) {
            toast.error("Müşteri adı zorunludur.");
            return;
        }
        if (items.length === 0) {
            toast.error("En az bir ürün eklemelisiniz.");
            return;
        }

        setLoading(true);
        try {
            const token = getToken();
            const payload = {
                customerName,
                customerEmail,
                customerPhone,
                customerAddress,
                offerDate,
                validUntil,
                currency,
                exchangeRate,
                taxRate,
                notes,
                generalConditions,
                items,
                deliveryTime,
                bankDetails: JSON.stringify(bankAccounts.filter(b => b.bankName || b.iban)),
                status: "Draft" // Default status
            };

            const url = isEdit
                ? `${API_BASE_URL}/api/offers/${id}`
                : `${API_BASE_URL}/api/offers`;

            const method = isEdit ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                toast.success(isEdit ? "Teklif güncellendi." : "Teklif oluşturuldu.");
                router.push("/admin/offers");
            } else {
                console.error(`Save failed with status: ${res.status} ${res.statusText}`);
                const errorText = await res.text();
                toast.error(`Kaydetme başarısız: ${errorText}`);
            }
        } catch (error) {
            console.error(error);
            toast.error("Bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const loadFonts = async (doc: jsPDF) => {
        try {
            const fontUrl = "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf";
            const fontRes = await fetch(fontUrl);
            const fontBuffer = await fontRes.arrayBuffer();
            const fontBase64 = Buffer.from(fontBuffer).toString("base64");

            doc.addFileToVFS("Roboto-Regular.ttf", fontBase64);
            doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
            doc.setFont("Roboto");
            return true;
        } catch (error) {
            console.error("Font loading failed", error);
            doc.setFont("helvetica");
            return false;
        }
    };

    const loadBoldFonts = async (doc: jsPDF) => {
        try {
            const fontBoldUrl = "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf";
            const fontBoldRes = await fetch(fontBoldUrl);
            const fontBoldBuffer = await fontBoldRes.arrayBuffer();
            const fontBoldBase64 = Buffer.from(fontBoldBuffer).toString("base64");

            doc.addFileToVFS("Roboto-Medium.ttf", fontBoldBase64);
            doc.addFont("Roboto-Medium.ttf", "Roboto", "bold");
            return true;
        } catch (e) {
            console.warn("Bold font not loaded");
            return false;
        }
    }

    const loadLogo = async () => {
        try {
            const logoUrl = "/logo.png";
            const logoRes = await fetch(logoUrl);
            const logoBlob = await logoRes.blob();
            return await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(logoBlob);
            });
        } catch (error) {
            console.error("Logo loading failed", error);
            return null;
        }
    };

    const generateStandardPDF = async (doc: jsPDF, logoBase64: string | null) => {
        if (logoBase64) {
            doc.addImage(logoBase64, "PNG", 14, 10, 30, 30);
        }

        doc.setFontSize(24);
        doc.setFont("Roboto", "bold");
        doc.text("ACAR GROUP", 50, 20);

        doc.setFontSize(10);
        doc.setFont("Roboto", "normal");
        doc.text("Teknoloji & Güvenlik Sistemleri", 50, 26);

        // Header Info Box
        doc.setFontSize(8);
        doc.text("Güvenlik Sistemleri - Network & Ağ - Otomasyon", 196, 18, { align: "right" });
        doc.text("Yapı - Tadilat - Mimari İnşaat Hizmetleri - Mekanik", 196, 22, { align: "right" });
        doc.text("Web Tasarım - Seo Hizmetleri - Yazılım - Elektrik Sistemleri", 196, 26, { align: "right" });

        // Thick Black Lines
        doc.setDrawColor(0);
        doc.setLineWidth(1.5);
        doc.line(14, 45, 196, 45);

        doc.setFontSize(12);
        doc.setFont("Roboto", "bold");
        doc.text("SAYIN", 105, 52, { align: "center" });

        doc.setFontSize(11);
        doc.text(customerName.toUpperCase(), 105, 58, { align: "center" });

        doc.setFontSize(10);
        doc.text("TARİH", 180, 52, { align: "right" });
        doc.setFont("Roboto", "normal");
        doc.text(new Date(offerDate).toLocaleDateString("tr-TR"), 180, 58, { align: "right" });

        doc.setLineWidth(1.5);
        doc.line(14, 62, 196, 62);

        if (deliveryTime) {
            doc.text("TESLİM SÜRESİ", 180, 68, { align: "right" });
            doc.setFont("Roboto", "normal");
            doc.text(deliveryTime.toUpperCase(), 180, 74, { align: "right" });
        }

        // Intro
        doc.setFontSize(9);
        doc.setFont("Roboto", "bold");
        doc.text("TALEP ETMİŞ OLDUĞUNUZ ÜRÜN/HİZMETLERİMİZLE İLGİLİ DETAYLI TEKLİFİMİZ AŞAĞIDAKİ GİBİDİR.", 14, 82);
        doc.text("GÖSTERMİŞ OLDUĞUNUZ İLGİYE TEŞEKKÜR EDER İYİ ÇALIŞMALAR DİLERİZ.", 14, 87);
        doc.text("SAYGILARIMIZLA ...", 196, 92, { align: "right" });

        // Table
        const tableColumn = ["MARKA / ÜRÜN KODU", "İŞLEM ADET/METRE", `BİRİM FİYAT ${currency}`, `TOPLAM ${currency}`];
        const tableRows = items.map(item => [
            item.productName.toUpperCase(),
            `${item.quantity} ${item.unit}`,
            item.unitPrice.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            item.totalPrice.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        ]);

        autoTable(doc, {
            startY: 97,
            head: [tableColumn],
            body: tableRows,
            theme: 'plain',
            headStyles: {
                fillColor: [0, 0, 0],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                font: 'Roboto', // Use our custom font in table
                halign: 'center'
            },
            bodyStyles: {
                font: 'Roboto',
                textColor: [0, 0, 0]
            },
            styles: { fontSize: 9, cellPadding: 3, lineColor: [200, 200, 200], lineWidth: 0.1 },
            columnStyles: {
                0: { cellWidth: 'auto' },
                1: { cellWidth: 35, halign: 'center' },
                2: { cellWidth: 35, halign: 'right' },
                3: { cellWidth: 35, halign: 'right' },
            },
        });

        // Totals
        // @ts-ignore
        const finalY = doc.lastAutoTable.finalY + 10;

        doc.setFontSize(9);
        doc.setFont("Roboto", "bold");

        doc.text(`TOPLAM (${currency})`, 160, finalY, { align: "right" });
        doc.text(subTotal.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }), 190, finalY, { align: "right" });

        doc.text(`KDV (%${taxRate})`, 160, finalY + 5, { align: "right" });
        doc.text(taxAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }), 190, finalY + 5, { align: "right" });

        doc.text(`GENEL TOPLAM (${currency})`, 160, finalY + 10, { align: "right" });
        doc.text(grandTotal.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }), 190, finalY + 10, { align: "right" });

        // Notes Box
        const notesY = finalY + 20;

        // Draw box around notes
        doc.setDrawColor(0);
        doc.setLineWidth(0.5);
        doc.rect(14, notesY, 182, 40);

        doc.setFontSize(9);
        doc.setFont("Roboto", "bold");
        doc.text("NOTLAR / TESLİM VB GENEL BİLGİLER", 140, notesY + 5, { align: "center", maxWidth: 80 });

        doc.setFontSize(8);
        doc.setFont("Roboto", "bold");
        doc.text("GENEL BİLGİLER", 16, notesY + 8);

        doc.setFont("Roboto", "normal");
        doc.setFontSize(8);

        // Split notes to fit in the left side of the box
        const splitNotes = doc.splitTextToSize(notes, 100);
        doc.text(splitNotes, 16, notesY + 14);

        // Vertical line in notes box
        doc.line(110, notesY, 110, notesY + 40);

        // Right side of notes box (General info placeholder or more notes)
        doc.setFontSize(8);
        doc.text("Toplam iki adet kurulum fiyatıdır kablo ölçüsü ise", 115, notesY + 15);
        doc.text("iş bitiminde hesaplanır.", 115, notesY + 20);

        // Signatures
        const sigY = notesY + 50;

        // Customer Signature Line
        doc.setLineWidth(0.5);
        doc.line(14, sigY, 196, sigY);

        doc.setFontSize(8);
        doc.setFont("Roboto", "bold");
        doc.text("ANLAŞMA YAPILAN FİRMA : " + customerName.toUpperCase(), 14, sigY + 5);
        doc.text("İSİM / İMZA / KAŞE / ONAY", 150, sigY + 5);

        // Company Signature Line
        doc.line(14, sigY + 25, 196, sigY + 25);
        doc.text("ANLAŞMA YAPAN FİRMA : ACAR BİLİŞİM", 14, sigY + 30);
        doc.text("GSM : 0544 114 07 07 / 0546 114 07 07", 14, sigY + 35);
        doc.text("MAIL : mehmet.acar.1997@outlook.com.tr", 14, sigY + 40);
        doc.text("ADRES : YAYLA MAH BARBAROS CD. NO:26/A 07600", 14, sigY + 45);
        doc.text("MANAVGAT / ANTALYA", 14, sigY + 50);

        doc.text("İSİM / İMZA / KAŞE / ONAY", 150, sigY + 30);
    };

    const drawFooterBlock = (doc: jsPDF, startY: number) => {
        let y = startY + 5; // Add some initial padding

        doc.setFontSize(9);
        doc.setFont("Roboto", "bold");
        doc.text("GENEL BİLGİLER", 105, y, { align: "center" });
        y += 5;

        doc.setFontSize(7);
        doc.setFont("Roboto", "normal");
        const infoText = "Fiyatlarımıza KDV dahildir (eğer belirtilmişse). GÜNCEL KUR ALINIR HER ZAMAN. Teklifimiz peşin ödeme esasına göre hazırlanmıştır. Kredi kartına % komisyon uygulanabilir. Ödemenin %50'si peşin %50'si iş bitiminde teslim alınır.";
        const splitInfo = doc.splitTextToSize(infoText, 180);
        doc.text(splitInfo, 105, y, { align: "center" });
        y += (splitInfo.length * 3.5) + 4; // Increased spacing

        doc.setFont("Roboto", "bold");
        doc.setTextColor(200, 0, 0); // Dark Red
        doc.text("GARANTİ DIŞI KALMA SEBEBLERİ", 105, y, { align: "center" });
        doc.setTextColor(0, 0, 0); // Reset
        y += 5;

        const warrantyText = "Cihazların firmamız dışında farklı bir firma tarafından bakım ve kontrol yapılması halinde 2 yıllık garanti süresi fesih edilir. Voltaj değişiklikleri, doğal afetler, sıvı teması gibi kullanıcı hataları garanti kapsamı dışındadır. Firmamız tarafından sorumluluk kabul edilmez.";
        const splitWarranty = doc.splitTextToSize(warrantyText, 180);
        doc.setFont("Roboto", "normal");
        doc.text(splitWarranty, 105, y, { align: "center" });
        y += (splitWarranty.length * 3.5) + 6;

        // Bank Accounts in Footer
        if (bankAccounts.length > 0) {
            y += 4;
            doc.setFont("Roboto", "bold");
            doc.setFontSize(8);
            doc.text("BANKA HESAP BİLGİLERİ", 105, y, { align: "center" });
            y += 5;
            doc.setFont("Roboto", "normal");

            bankAccounts.filter(b => b.bankName && b.iban).forEach(acc => {
                doc.text(`${acc.bankName}: ${acc.iban}`, 105, y, { align: "center" });
                y += 4;
            });
        }

        return y + 5;
    };

    const drawSignatures = (doc: jsPDF, y: number) => {
        const startY = y;

        // Left - Customer
        doc.setFontSize(8);
        doc.setFont("Roboto", "bold");
        doc.text("ANLAŞMA YAPILAN ŞAHIS :", 14, startY);

        // Dynamic underline for customer name
        const custLabelWidth = doc.getTextWidth("ANLAŞMA YAPILAN ŞAHIS :");
        doc.setLineWidth(0.1);
        doc.line(14 + custLabelWidth + 2, startY, 90, startY);

        doc.setFontSize(8);
        doc.text("GSM :", 14, startY + 6);
        doc.text("MAİL :", 14, startY + 12);
        doc.text("ADRES :", 14, startY + 18);
        doc.text("ONAY TARİH VE SAAT :", 14, startY + 24);

        // Signature Line Left
        doc.text("İSİM / İMZA / KAŞE / ONAY", 50, startY + 35, { align: "center" });
        doc.line(20, startY + 33, 80, startY + 33);

        // Right - Company
        const rightX = 110;
        doc.text("ANLAŞMA YAPAN FİRMA : ACAR BİLİŞİM", rightX, startY);
        doc.text("GSM : 0544 114 07 07 / 0546 114 07 07", rightX, startY + 6);
        doc.text("MAİL : mehmet.acar.1997@outlook.com.tr", rightX, startY + 12);
        doc.text("ADRES : YAYLA MAH.BARBAROS CD. NO:26/A 07600", rightX, startY + 18);
        doc.text("MANAVGAT / ANTALYA", rightX, startY + 24);

        // Signature Line Right
        doc.text("İSİM / İMZA / KAŞE / ONAY", rightX + 40, startY + 35, { align: "center" });
        doc.line(rightX + 10, startY + 33, rightX + 70, startY + 33);
    };

    const generateCorporateAPDF = async (doc: jsPDF, logoBase64: string | null) => {
        // Header
        if (logoBase64) {
            // Adjusted dimensions to prevent squashing (was 50x16)
            doc.addImage(logoBase64, "PNG", 14, 10, 40, 22);
        } else {
            doc.setFontSize(20);
            doc.setFont("Roboto", "bold");
            doc.text("ACAR GROUP", 14, 20);
        }

        doc.setFontSize(10);
        doc.setFont("Roboto", "normal");
        doc.text("SAYIN", 105, 18, { align: "center" });
        doc.setFontSize(12);
        doc.setFont("Roboto", "bold");

        // Center the name and underline
        doc.text(customerName.toUpperCase(), 105, 24, { align: "center" });
        const nameWidth = doc.getTextWidth(customerName.toUpperCase());
        const lineWidth = Math.max(nameWidth + 10, 50); // Minimum 50, or name width + padding
        doc.setLineWidth(1.5);
        doc.line(105 - (lineWidth / 2), 26, 105 + (lineWidth / 2), 26);

        doc.setFontSize(10);
        doc.setFont("Roboto", "bold");
        doc.text("TARİH", 196, 18, { align: "right" });
        doc.setFont("Roboto", "normal");
        doc.text(new Date(offerDate).toLocaleDateString("tr-TR"), 196, 24, { align: "right" });

        if (deliveryTime) {
            doc.text("TESLİM SÜRESİ", 196, 29, { align: "right" });
            doc.setFont("Roboto", "normal");
            doc.text(deliveryTime.toUpperCase(), 196, 33, { align: "right" });
        }

        // Line
        doc.setLineWidth(1);
        doc.line(14, 35, 196, 35);

        // Intro
        doc.setFontSize(8);
        doc.setFont("Roboto", "bold");
        doc.text("TALEP ETMİŞ OLDUĞUNUZ ÜRÜN İLE HİZMETLERİMİZLE İLGİLİ DETAYLI TEKLİFİMİZ AŞAĞIDAKİ GİBİDİR", 105, 40, { align: "center" });
        doc.text("GÖSTERMİŞ OLDUĞUNUZ İLGİYE TEŞEKKÜR EDER İYİ ÇALIŞMALAR DİLERİZ", 105, 45, { align: "center" });
        doc.text("SAYGILARIMIZLA ...", 196, 50, { align: "right" });

        // Table
        const tableColumn = ["MARKA / ÜRÜN KODU", "BİRİM\nADET/METRE", `BİRİM FİYAT ${currency}`, `TOPLAM ${currency}`];
        const tableRows = items.map(item => [
            item.productName.toUpperCase(),
            `${item.quantity} ${item.unit}`,
            item.unitPrice.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            item.totalPrice.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        ]);

        autoTable(doc, {
            startY: 52,
            head: [tableColumn],
            body: tableRows,
            theme: 'grid',
            headStyles: {
                fillColor: [0, 0, 0],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                font: 'Roboto',
                halign: 'center',
                valign: 'middle',
                lineWidth: 0.2,
                lineColor: [0, 0, 0]
            },
            bodyStyles: {
                font: 'Roboto',
                textColor: [0, 0, 0],
                valign: 'middle',
                lineWidth: 0.2,
                lineColor: [0, 0, 0]
            },
            columnStyles: {
                0: { cellWidth: 'auto' }, // Name
                1: { cellWidth: 25, halign: 'center' }, // Qty
                2: { cellWidth: 35, halign: 'center' }, // Price
                3: { cellWidth: 35, halign: 'center' }, // Total
            },
            styles: { fontSize: 8, cellPadding: 2 }
        });

        // @ts-ignore
        const finalY = doc.lastAutoTable.finalY + 2; // Little overlap fix

        // Totals Table (Manual)
        const boxWidth = 70;
        const boxX = 196 - boxWidth;

        doc.setDrawColor(0);
        doc.setLineWidth(0.2);

        // Header for totals
        const lineHeight = 7;
        let currentY = finalY;

        // Row 1: Subtotal
        doc.rect(boxX, currentY, boxWidth, lineHeight);
        doc.setFontSize(8);
        doc.setFont("Roboto", "bold");
        doc.text(`GÜNCEL KUR TOPLAM (${currency})`, boxX + 2, currentY + 5);
        doc.text(subTotal.toLocaleString("tr-TR", { minimumFractionDigits: 2 }), 194, currentY + 5, { align: "right" });
        currentY += lineHeight;

        // Row 2: Tax
        doc.rect(boxX, currentY, boxWidth, lineHeight);
        doc.text(`KDV (%${taxRate})`, boxX + 2, currentY + 5);
        doc.text(taxAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 }), 194, currentY + 5, { align: "right" });
        currentY += lineHeight;

        // Row 3: Grand Total
        doc.rect(boxX, currentY, boxWidth, lineHeight);
        doc.text(`GÜNCEL KUR GENEL TOPLAM (${currency})`, boxX + 2, currentY + 5);
        doc.text(grandTotal.toLocaleString("tr-TR", { minimumFractionDigits: 2 }), 194, currentY + 5, { align: "right" });
        currentY += lineHeight;

        // Row 4: Deal Price (Placeholder or same)
        doc.rect(boxX, currentY, boxWidth, lineHeight);
        doc.setTextColor(200, 0, 0);
        doc.text("ANLAŞILAN FİYAT", boxX + 15, currentY + 5);
        // doc.text("...", 194, currentY + 5, { align: "right" }); // Left empty for hand writing or logic
        doc.setTextColor(0, 0, 0);

        // Left Side Content (Genel Bilgilendirme Box) - ONLY FOR TYPE A
        const leftBoxWidth = boxX - 14;
        const leftBoxHeight = (lineHeight * 4); // Match total height

        doc.rect(14, finalY, leftBoxWidth, leftBoxHeight);
        doc.setFontSize(9);
        doc.setFont("Roboto", "bold");
        doc.text("GENEL BİLGİLENDİRME", 14 + (leftBoxWidth / 2), finalY + 5, { align: "center" });

        doc.setFontSize(7);
        doc.setFont("Roboto", "normal");
        const noteText = notes.length > 0 ? notes : "Yukarıdaki teklifte belirtilen ekipman ve malzemelerde metre ve adet değişiklikleri gösterilebilir.";
        const splitNote = doc.splitTextToSize(noteText, leftBoxWidth - 4);
        doc.text(splitNote, 16, finalY + 10);

        currentY += lineHeight + 5; // Add some gap

        // Footer Text Block
        currentY = drawFooterBlock(doc, currentY);

        // Signatures
        drawSignatures(doc, currentY + 10);
    };

    const generateCorporateBPDF = async (doc: jsPDF, logoBase64: string | null) => {
        // Header (Same as A)
        if (logoBase64) {
            // Adjusted dimensions to prevent squashing (was 50x16)
            doc.addImage(logoBase64, "PNG", 14, 10, 40, 22);
        } else {
            doc.setFontSize(20);
            doc.setFont("Roboto", "bold");
            doc.text("ACAR GROUP", 14, 20);
        }

        doc.setFontSize(10);
        doc.setFont("Roboto", "normal");
        doc.text("SAYIN", 105, 18, { align: "center" });
        doc.setFontSize(12);
        doc.setFont("Roboto", "bold");

        // Center the name and underline
        doc.text(customerName.toUpperCase(), 105, 24, { align: "center" });
        const nameWidth = doc.getTextWidth(customerName.toUpperCase());
        const lineWidth = Math.max(nameWidth + 10, 50);
        doc.setLineWidth(1.5);
        doc.line(105 - (lineWidth / 2), 26, 105 + (lineWidth / 2), 26);

        doc.setFontSize(10);
        doc.setFont("Roboto", "bold");
        doc.text("TARİH", 196, 18, { align: "right" });
        doc.setFont("Roboto", "normal");
        doc.text(new Date(offerDate).toLocaleDateString("tr-TR"), 196, 24, { align: "right" });

        if (deliveryTime) {
            doc.text("TESLİM SÜRESİ", 196, 29, { align: "right" });
            doc.setFont("Roboto", "normal");
            doc.text(deliveryTime.toUpperCase(), 196, 33, { align: "right" });
        }

        doc.setLineWidth(1);
        doc.line(14, 35, 196, 35);

        doc.setFontSize(8);
        doc.setFont("Roboto", "bold");
        doc.text("TALEP ETMİŞ OLDUĞUNUZ ÜRÜN İLE HİZMETLERİMİZLE İLGİLİ DETAYLI TEKLİFİMİZ AŞAĞIDAKİ GİBİDİR", 105, 40, { align: "center" });
        doc.text("GÖSTERMİŞ OLDUĞUNUZ İLGİYE TEŞEKKÜR EDER İYİ ÇALIŞMALAR DİLERİZ", 105, 45, { align: "center" });
        doc.text("SAYGILARIMIZLA ...", 196, 50, { align: "right" });

        const tableColumn = ["MARKA / ÜRÜN KODU", "BİRİM\nADET/METRE", `BİRİM FİYAT ${currency}`, `TOPLAM ${currency}`];
        const tableRows = items.map(item => [
            item.productName.toUpperCase(),
            `${item.quantity} ${item.unit}`,
            item.unitPrice.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            item.totalPrice.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        ]);

        autoTable(doc, {
            startY: 52,
            head: [tableColumn],
            body: tableRows,
            theme: 'grid',
            headStyles: {
                fillColor: [0, 0, 0],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                font: 'Roboto',
                halign: 'center',
                valign: 'middle',
                lineWidth: 0.2,
                lineColor: [0, 0, 0]
            },
            bodyStyles: {
                font: 'Roboto',
                textColor: [0, 0, 0],
                valign: 'middle',
                lineWidth: 0.2,
                lineColor: [0, 0, 0]
            },
            columnStyles: {
                0: { cellWidth: 'auto' },
                1: { cellWidth: 25, halign: 'center' },
                2: { cellWidth: 35, halign: 'center' },
                3: { cellWidth: 35, halign: 'center' },
            },
            styles: { fontSize: 8, cellPadding: 2 }
        });

        // @ts-ignore
        const finalY = doc.lastAutoTable.finalY + 2;

        // Totals (Same right side)
        const boxWidth = 70;
        const boxX = 196 - boxWidth;
        const lineHeight = 7;
        let currentY = finalY;

        // Row 1: Subtotal
        doc.rect(boxX, currentY, boxWidth, lineHeight);
        doc.setFontSize(8);
        doc.setFont("Roboto", "bold");
        doc.text(`GÜNCEL KUR TOPLAM (${currency})`, boxX + 2, currentY + 5);
        doc.text(subTotal.toLocaleString("tr-TR", { minimumFractionDigits: 2 }), 194, currentY + 5, { align: "right" });
        currentY += lineHeight;

        // Row 2: Tax
        doc.rect(boxX, currentY, boxWidth, lineHeight);
        doc.text(`KDV (%${taxRate})`, boxX + 2, currentY + 5);
        doc.text(taxAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 }), 194, currentY + 5, { align: "right" });
        currentY += lineHeight;

        // Row 3: Grand Total
        doc.rect(boxX, currentY, boxWidth, lineHeight);
        doc.text(`GÜNCEL KUR GENEL TOPLAM (${currency})`, boxX + 2, currentY + 5);
        doc.text(grandTotal.toLocaleString("tr-TR", { minimumFractionDigits: 2 }), 194, currentY + 5, { align: "right" });
        currentY += lineHeight;

        // Row 4: Deal Price
        doc.rect(boxX, currentY, boxWidth, lineHeight);
        doc.setTextColor(200, 0, 0);
        doc.text("ANLAŞILAN FİYAT", boxX + 15, currentY + 5);
        doc.setTextColor(0, 0, 0);

        // Left Side: Notlar ve Teslim Bilgileri
        const leftBoxWidth = boxX - 14;
        const leftBoxHeight = (lineHeight * 4); // Match total height

        doc.rect(14, finalY, leftBoxWidth, leftBoxHeight);
        doc.setFontSize(9);
        doc.setFont("Roboto", "bold");
        // Title with underline
        doc.text("NOTLAR VE TESLİM BİLGİLERİ", 14 + (leftBoxWidth / 2), finalY + 5, { align: "center" });
        doc.setLineWidth(0.2);
        doc.line(14, finalY + 7, 14 + leftBoxWidth, finalY + 7);

        doc.setFontSize(7);
        doc.setFont("Roboto", "normal");
        doc.text("GÜNCEL KURDAN HESAPLANIR", 14 + (leftBoxWidth / 2), finalY + 11, { align: "center" });

        const noteText = notes.length > 0 ? notes : "Yukarıdaki teklifte belirtilen ekipman ve malzemelerde metre ve adet değişiklikleri gösterilebilir.";
        const splitNote = doc.splitTextToSize(noteText, leftBoxWidth - 4);
        doc.text(splitNote, 16, finalY + 15);

        currentY += lineHeight + 5;

        // Footer Text Block
        currentY = drawFooterBlock(doc, currentY);

        // Signatures
        drawSignatures(doc, currentY + 10);
    };

    const generatePDF = async () => {
        const doc = new jsPDF();
        await loadFonts(doc);
        await loadBoldFonts(doc);
        const logoBase64 = await loadLogo();

        if (selectedTemplate === "corporate-a") {
            await generateCorporateAPDF(doc, logoBase64);
        } else if (selectedTemplate === "corporate-b") {
            await generateCorporateBPDF(doc, logoBase64);
        } else {
            await generateStandardPDF(doc, logoBase64);
        }

        doc.save(`Teklif_${customerName.replace(/\s+/g, '_')}.pdf`);
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full">
                        <ArrowLeft size={24} className="text-slate-600" />
                    </button>
                    <h1 className="text-2xl font-bold text-slate-900">
                        {isEdit ? "Teklifi Düzenle" : "Yeni Teklif Oluştur"}
                    </h1>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={generatePDF}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
                    >
                        <FileDown size={20} />
                        PDF İndir
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                        <Save size={20} />
                        {loading ? "Kaydediliyor..." : "Kaydet"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Form */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Customer Info */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4 text-slate-800">Müşteri Bilgileri</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Firma / Müşteri Adı</label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 bg-white"
                                    placeholder="Örn: 60. Yıl Okulu"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">E-posta</label>
                                <input
                                    type="email"
                                    value={customerEmail}
                                    onChange={(e) => setCustomerEmail(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
                                <input
                                    type="text"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 bg-white"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Adres</label>
                                <textarea
                                    value={customerAddress}
                                    onChange={(e) => setCustomerAddress(e.target.value)}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 bg-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-slate-800">Ürünler / Hizmetler</h2>



                            {/* Template Selection */}
                            <div className="relative w-64">
                                <input
                                    type="text"
                                    placeholder="Ürün ara..."
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 bg-white"
                                />
                                <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />

                                {searchResults.length > 0 && (
                                    <div className="absolute top-full left-0 w-full bg-white border border-slate-200 rounded-lg shadow-lg mt-1 z-10 max-h-60 overflow-y-auto">
                                        {searchResults.map((p) => (
                                            <button
                                                key={p.id}
                                                onClick={() => addProduct(p)}
                                                className="w-full text-left px-3 py-2 hover:bg-slate-50 text-sm border-b border-slate-100 last:border-0"
                                            >
                                                <div className="font-medium text-slate-800">{p.name}</div>
                                                <div className="text-xs text-slate-500">{p.price} TL</div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {items.map((item, index) => (
                                <div key={index} className="flex gap-3 items-start p-3 bg-slate-50 rounded-lg border border-slate-200">
                                    <div className="flex-1 space-y-2">
                                        <input
                                            type="text"
                                            value={item.productName}
                                            onChange={(e) => updateItem(index, "productName", e.target.value)}
                                            className="w-full px-2 py-1 text-sm border border-slate-300 rounded bg-white font-medium text-slate-900"
                                            placeholder="Ürün Adı"
                                        />
                                        <div className="flex gap-2">
                                            <div className="w-24">
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                                                    className="w-full px-2 py-1 text-sm border border-slate-300 rounded bg-white text-slate-900"
                                                    placeholder="Miktar"
                                                />
                                            </div>
                                            <div className="w-24">
                                                <input
                                                    type="text"
                                                    value={item.unit}
                                                    onChange={(e) => updateItem(index, "unit", e.target.value)}
                                                    className="w-full px-2 py-1 text-sm border border-slate-300 rounded bg-white text-slate-900"
                                                    placeholder="Birim"
                                                />
                                            </div>
                                            <div className="w-32">
                                                <input
                                                    type="number"
                                                    value={item.unitPrice}
                                                    onChange={(e) => updateItem(index, "unitPrice", Number(e.target.value))}
                                                    className="w-full px-2 py-1 text-sm border border-slate-300 rounded bg-white text-slate-900"
                                                    placeholder="Birim Fiyat"
                                                />
                                            </div>
                                            <div className="flex-1 flex items-center justify-end text-sm font-bold text-slate-700">
                                                {item.totalPrice.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeItem(index)}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}

                            <button
                                onClick={addCustomItem}
                                className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-emerald-500 hover:text-emerald-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                            >
                                <Plus size={18} />
                                Manuel Ürün Ekle
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Settings & Totals */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4 text-slate-800">Teklif Ayarları</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Şablon</label>
                                <select
                                    value={selectedTemplate}
                                    onChange={(e) => setSelectedTemplate(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 bg-white"
                                >
                                    <option value="standard">Standart</option>
                                    <option value="corporate-a">Kurumsal (Tip 1)</option>
                                    <option value="corporate-b">Kurumsal (Tip 2)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Teklif Tarihi</label>
                                <input
                                    type="date"
                                    value={offerDate}
                                    onChange={(e) => setOfferDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Geçerlilik Tarihi</label>
                                <input
                                    type="date"
                                    value={validUntil}
                                    onChange={(e) => setValidUntil(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Teslim Süresi</label>
                                <input
                                    type="text"
                                    value={deliveryTime}
                                    onChange={(e) => setDeliveryTime(e.target.value)}
                                    placeholder="Örn: 3 İş Günü"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 bg-white"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Para Birimi</label>
                                    <select
                                        value={currency}
                                        onChange={(e) => setCurrency(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 bg-white"
                                    >
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                        <option value="TRY">TRY</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">KDV (%)</label>
                                    <input
                                        type="number"
                                        value={taxRate}
                                        onChange={(e) => setTaxRate(Number(e.target.value))}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 bg-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bank Accounts */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4 text-slate-800">Banka Bilgileri</h2>
                        <div className="space-y-4">
                            {bankAccounts.map((account, index) => (
                                <div key={index} className="space-y-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-slate-900"
                                                value={account.bankName}
                                                onChange={(e) => updateBankAccount(index, "bankName", e.target.value)}
                                                placeholder="Banka Adı"
                                            />
                                        </div>
                                        <button
                                            onClick={() => removeBankAccount(index)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-slate-900"
                                            value={account.iban}
                                            onChange={(e) => updateBankAccount(index, "iban", e.target.value)}
                                            placeholder="IBAN"
                                        />
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addBankAccount}
                                className="flex items-center gap-2 text-sm text-emerald-600 font-medium hover:text-emerald-700 transition"
                            >
                                <Plus size={16} />
                                Hesap Ekle
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4 text-slate-800">Özet</h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-slate-600">
                                <span>Ara Toplam</span>
                                <span>{subTotal.toFixed(2)} {currency}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>KDV (%{taxRate})</span>
                                <span>{taxAmount.toFixed(2)} {currency}</span>
                            </div>
                            <div className="pt-3 border-t border-slate-100 flex justify-between font-bold text-lg text-slate-900">
                                <span>Genel Toplam</span>
                                <span>{grandTotal.toFixed(2)} {currency}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4 text-slate-800">Notlar</h2>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={6}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-slate-900 bg-white"
                            placeholder="Teklif notları..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function OfferCreatePage() {
    return (
        <Suspense fallback={<div>Yükleniyor...</div>}>
            <OfferCreateContent />
        </Suspense>
    );
}
