"use client";

import { useState, useEffect } from "react";
import { getToken } from "@/lib/auth";
import type { Customer } from "@/lib/auth";

// Fetches /api/customers using the shared acargroup_* JWT so admin customer UI stays in sync.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [customerJobs, setCustomerJobs] = useState<any[]>([]);
    const [customerTransactions, setCustomerTransactions] = useState<any[]>([]);
    const [customerBalance, setCustomerBalance] = useState<any>(null);
    const [customerAddresses, setCustomerAddresses] = useState<any[]>([]);
    const [customerProducts, setCustomerProducts] = useState<any[]>([]);
    const [customerDocuments, setCustomerDocuments] = useState<any[]>([]);
    const [customerOffers, setCustomerOffers] = useState<any[]>([]);
    const [showOfferForm, setShowOfferForm] = useState(false);
    const [editingOffer, setEditingOffer] = useState<any | null>(null);
    const [offerFormData, setOfferFormData] = useState({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        customerAddress: "",
        offerDate: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        currency: "TRY",
        taxRate: 20,
        notes: "",
        items: [] as any[]
    });
    const [uploadingDoc, setUploadingDoc] = useState(false);
    const [detailTab, setDetailTab] = useState<"profile" | "jobs" | "finance" | "addresses" | "products" | "invoices" | "waybills" | "offers">("profile");
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        tc: "",
        vkn: "",
        addressLabel: "Ev",
        city: "",
        district: "",
        fullAddress: ""
    });
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [editFormData, setEditFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        tc: "",
        vkn: "",
        isActive: true
    });
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState<any | null>(null);
    const [newAddress, setNewAddress] = useState({
        label: "Ev",
        city: "",
        district: "",
        fullAddress: "",
        postalCode: "",
        notes: ""
    });
    const [customerListTab, setCustomerListTab] = useState<'active' | 'deleted'>('active');
    const [showProductForm, setShowProductForm] = useState(false);
    const [productFormData, setProductFormData] = useState({
        productId: null as number | null,
        productName: "",
        quantity: 1,
        unitPrice: 0,
        serialNumber: "",
        notes: "",
        purchaseDate: new Date().toISOString().split('T')[0]
    });
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

    // Product Selection State
    const [categories, setCategories] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [productEntryMode, setProductEntryMode] = useState<'manual' | 'select'>('select');
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

    // Fetch categories and products
    useEffect(() => {
        const fetchCatalog = async () => {
            const token = getToken();
            if (!token) return;

            try {
                const [catRes, prodRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/categories`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${API_BASE_URL}/api/products`, { headers: { Authorization: `Bearer ${token}` } })
                ]);

                if (catRes.ok) setCategories(await catRes.json());
                if (prodRes.ok) setProducts(await prodRes.json());
            } catch (error) {
                console.error("Error fetching catalog:", error);
            }
        };

        fetchCatalog();
    }, []);

    // Customer Device Management State
    const [customerDevices, setCustomerDevices] = useState<any[]>([]);
    const [showDeviceModal, setShowDeviceModal] = useState(false);
    const [editingDevice, setEditingDevice] = useState<any | null>(null);
    const [deviceFormData, setDeviceFormData] = useState({
        customerPurchasedProductId: null as number | null,
        deviceType: "Recording",
        deviceUsername: "",
        devicePassword: "",
        localIpAddress: "",
        macAddress: "",
        modemInfo: "",
        modemPassword: "",
        hasInternetMonitoring: false,
        serialNumber: "",
        qrCodeUrl: "",

        // New Fields
        modemSerialNumber: "",
        deviceImporter: "",
        deviceModel: "",
        materialNotes: "",

        deviceAddress: "",
        cameraNotes: "",
        hddSerialNumber: "",
        hddBrand: "",
        hddImporter: "",
        hddCapacity: ""
    });
    const [qrCodeFile, setQrCodeFile] = useState<File | null>(null);
    const [isDeviceFormOpen, setIsDeviceFormOpen] = useState(false);
    const [expandedProductDates, setExpandedProductDates] = useState<Set<string>>(new Set());

    const filteredCustomers = customers.filter(customer =>
        customer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery)
    );

    const handleExport = () => {
        const dataStr = JSON.stringify(filteredCustomers, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `musteriler_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const fetchCustomers = async (tab: 'active' | 'deleted' = 'active') => {
        const token = getToken();

        if (!token) {
            setError("Oturum bilgisi bulunamadı. Lütfen giriş yapın.");
            setLoading(false);
            return;
        }

        const endpoint = tab === 'active'
            ? `${API_BASE_URL}/api/customers/active`
            : `${API_BASE_URL}/api/customers/inactive`;

        try {
            const response = await fetch(endpoint, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    setError("Yetkiniz yok veya oturum süreniz dolmuş. Lütfen tekrar giriş yapın.");
                } else {
                    setError("Müşteri verileri alınırken bir hata oluştu.");
                }
                setLoading(false);
                return;
            }

            const data = await response.json();
            setCustomers(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError("Müşteri verileri alınırken bir hata oluştu.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers(customerListTab);
    }, [customerListTab]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (openDropdownId !== null) {
                const target = event.target as HTMLElement;
                if (!target.closest('.relative')) {
                    setOpenDropdownId(null);
                }
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [openDropdownId]);


    const handleCreateCustomer = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = getToken();
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/customers`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert("Müşteri başarıyla eklendi!");
                setShowCreateForm(false);
                setFormData({ fullName: "", email: "", phone: "", password: "", tc: "", vkn: "", addressLabel: "Ev", city: "", district: "", fullAddress: "" });
                const data = await (await fetch(`${API_BASE_URL}/api/customers`, {
                    headers: { Authorization: `Bearer ${token}` }
                })).json();
                setCustomers(data);
            } else {
                const error = await response.json();
                alert(error.message || "Müşteri eklenemedi.");
            }
        } catch (error) {
            console.error("Error creating customer:", error);
            alert("Bir hata oluştu.");
        }
    };

    const handleEdit = (customer: Customer) => {
        setEditingCustomer(customer);
        setEditFormData({
            fullName: customer.fullName,
            email: customer.email,
            phone: customer.phone,
            tc: customer.tc || "",
            vkn: customer.vkn || "",
            isActive: customer.isActive
        });
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCustomer) return;

        const token = getToken();
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/customers/${editingCustomer.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(editFormData),
            });

            if (response.ok) {
                alert("Müşteri güncellendi!");
                setEditingCustomer(null);
                const data = await (await fetch(`${API_BASE_URL}/api/customers`, {
                    headers: { Authorization: `Bearer ${token}` }
                })).json();
                setCustomers(data);
            } else {
                alert("Güncelleme başarısız.");
            }
        } catch (error) {
            console.error("Error updating customer:", error);
            alert("Bir hata oluştu.");
        }
    };

    const handleDelete = async (customerId: number, customerName: string) => {
        if (!confirm(`${customerName} müşterisini silmek istediğinizden emin misiniz?`)) return;

        const token = getToken();
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/customers/${customerId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok || response.status === 204) {
                alert("Müşteri silindi.");
                const data = await (await fetch(`${API_BASE_URL}/api/customers`, {
                    headers: { Authorization: `Bearer ${token}` }
                })).json();
                setCustomers(data);
            } else {
                alert("Silme başarısız.");
            }
        } catch (error) {
            console.error("Error deleting customer:", error);
            alert("Bir hata oluştu.");
        }
    };

    const fetchCustomerDetails = async (customer: Customer) => {
        setSelectedCustomer(customer);
        setDetailTab("profile");
        setDetailsLoading(true);
        const token = getToken();
        if (!token) return;

        try {
            const [jobsRes, txRes, balanceRes, addrRes, prodRes, docRes, offersRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/jobs/customer/${customer.id}`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/api/finance/customer/${customer.id}/transactions`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/api/finance/customer/${customer.id}/balance`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/api/customer/addresses/customer/${customer.id}`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/api/customer-purchased-products/customer/${customer.id}`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/api/customer-documents/customer/${customer.id}`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/api/offers/customer/${customer.id}`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            if (jobsRes.ok) setCustomerJobs(await jobsRes.json());
            if (txRes.ok) setCustomerTransactions(await txRes.json());
            if (balanceRes.ok) setCustomerBalance(await balanceRes.json());
            if (addrRes.ok) setCustomerAddresses(await addrRes.json());
            if (prodRes.ok) setCustomerProducts(await prodRes.json());
            if (docRes.ok) setCustomerDocuments(await docRes.json());
            if (offersRes.ok) setCustomerOffers(await offersRes.json());

        } catch (error) {
            console.error("Error fetching details:", error);
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: number) => {
        if (!e.target.files || !e.target.files[0] || !selectedCustomer) return;

        const file = e.target.files[0];
        const token = getToken();
        if (!token) return;

        // Validate file type and size
        if (!file.type.startsWith('image/')) {
            alert('Sadece resim dosyaları yüklenebilir.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('Dosya boyutu 5MB\'den büyük olamaz.');
            return;
        }

        setUploadingDoc(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('customerId', selectedCustomer.id.toString());
            formData.append('type', docType.toString());

            const response = await fetch(`${API_BASE_URL}/api/customer-documents/upload`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                alert('Belge başarıyla yüklendi!');
                // Refresh documents
                const docRes = await fetch(`${API_BASE_URL}/api/customer-documents/customer/${selectedCustomer.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (docRes.ok) setCustomerDocuments(await docRes.json());
            } else {
                const error = await response.json();
                alert(error.message || 'Yükleme başarısız.');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Bir hata oluştu.');
        } finally {
            setUploadingDoc(false);
            e.target.value = '';
        }
    };

    const handleDocumentDelete = async (documentId: number) => {
        if (!confirm('Bu belgeyi silmek istediğinizden emin misiniz?')) return;

        const token = getToken();
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/customer-documents/${documentId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok || response.status === 204) {
                alert('Belge silindi.');
                // Refresh documents
                if (selectedCustomer) {
                    const docRes = await fetch(`${API_BASE_URL}/api/customer-documents/customer/${selectedCustomer.id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (docRes.ok) setCustomerDocuments(await docRes.json());
                }
            } else {
                alert('Silme başarısız.');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Bir hata oluştu.');
        }
    };

    const handleProductCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCustomer) return;

        const token = getToken();
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/customer-purchased-products/customer/${selectedCustomer.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(productFormData)
            });

            if (response.ok) {
                alert('Ürün eklendi!');
                setShowProductForm(false);
                setProductFormData({ productId: null, productName: "", quantity: 1, unitPrice: 0, serialNumber: "", notes: "", purchaseDate: new Date().toISOString().split('T')[0] });
                // Refresh products
                const prodRes = await fetch(`${API_BASE_URL}/api/customer-purchased-products/customer/${selectedCustomer.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (prodRes.ok) setCustomerProducts(await prodRes.json());
            } else {
                alert('Ürün eklenemedi.');
            }
        } catch (error) {
            console.error('Product create error:', error);
            alert('Bir hata oluştu.');
        }
    };

    const handleProductDelete = async (productId: number) => {
        if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return;

        const token = getToken();
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/customer-purchased-products/${productId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok || response.status === 204) {
                alert('Ürün silindi.');
                if (selectedCustomer) {
                    const prodRes = await fetch(`${API_BASE_URL}/api/customer-purchased-products/customer/${selectedCustomer.id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (prodRes.ok) setCustomerProducts(await prodRes.json());
                }
            } else {
                alert('Silme başarısız.');
            }
        } catch (error) {
            console.error('Product delete error:', error);
            alert('Bir hata oluştu.');
        }
    };

    // Device Management Functions
    const fetchCustomerDevices = async (customerId: number) => {
        const token = getToken();
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/customer-devices/customer/${customerId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setCustomerDevices(await res.json());
            }
        } catch (error) {
            console.error("Error fetching devices:", error);
        }
    };

    const handleDeviceSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCustomer) return;

        const token = getToken();
        if (!token) return;

        const url = editingDevice
            ? `${API_BASE_URL}/api/customer-devices/${editingDevice.id}`
            : `${API_BASE_URL}/api/customer-devices/customer/${selectedCustomer.id}`;

        const method = editingDevice ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(deviceFormData)
            });

            if (response.ok) {
                const savedDevice = await response.json();

                // Upload QR Code if selected
                if (qrCodeFile) {
                    const formData = new FormData();
                    formData.append('file', qrCodeFile);

                    const uploadRes = await fetch(`${API_BASE_URL}/api/customer-devices/${savedDevice.id}/qr-code`, {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${token}` },
                        body: formData
                    });

                    if (!uploadRes.ok) {
                        alert('Cihaz kaydedildi ancak QR kod yüklenemedi.');
                    }
                }

                alert(editingDevice ? 'Cihaz güncellendi!' : 'Cihaz eklendi!');
                setShowDeviceModal(false);
                setEditingDevice(null);
                setDeviceFormData({
                    customerPurchasedProductId: null,
                    deviceType: "Recording",
                    deviceUsername: "",
                    devicePassword: "",
                    localIpAddress: "",
                    macAddress: "",
                    modemInfo: "",
                    modemPassword: "",
                    hasInternetMonitoring: false,
                    serialNumber: "",
                    qrCodeUrl: "",

                    // New Fields
                    modemSerialNumber: "",
                    deviceImporter: "",
                    deviceModel: "",
                    materialNotes: "",

                    deviceAddress: "",
                    cameraNotes: "",
                    hddSerialNumber: "",
                    hddBrand: "",
                    hddImporter: "",
                    hddCapacity: ""
                });
                setQrCodeFile(null);
                fetchCustomerDevices(selectedCustomer.id);
            } else {
                alert('İşlem başarısız.');
            }
        } catch (error) {
            console.error('Error saving device:', error);
            alert('Bir hata oluştu.');
        }
    };

    const handleDeviceDelete = async (id: number) => {
        if (!confirm('Bu cihaz kaydını silmek istediğinize emin misiniz?')) return;

        const token = getToken();
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/customer-devices/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                if (selectedCustomer) fetchCustomerDevices(selectedCustomer.id);
            } else {
                alert('Silme işlemi başarısız.');
            }
        } catch (error) {
            console.error('Error deleting device:', error);
        }
    };

    const openDeviceModal = (device?: any) => {
        setQrCodeFile(null);
        if (device) {
            setEditingDevice(device);
            setDeviceFormData({
                customerPurchasedProductId: device.customerPurchasedProductId,
                deviceType: device.deviceType || "Recording",
                deviceUsername: device.deviceUsername || "",
                devicePassword: device.devicePassword || "",
                localIpAddress: device.localIpAddress || "",
                macAddress: device.macAddress || "",
                modemInfo: device.modemInfo || "",
                modemPassword: device.modemPassword || "",
                hasInternetMonitoring: device.hasInternetMonitoring,
                serialNumber: device.serialNumber || "",
                qrCodeUrl: device.qrCodeUrl || "",

                // New Fields
                modemSerialNumber: device.modemSerialNumber || "",
                deviceImporter: device.deviceImporter || "",
                deviceModel: device.deviceModel || "",
                materialNotes: device.materialNotes || "",

                deviceAddress: device.deviceAddress || "",
                cameraNotes: device.cameraNotes || "",
                hddSerialNumber: device.hddSerialNumber || "",
                hddBrand: device.hddBrand || "",
                hddImporter: device.hddImporter || "",
                hddCapacity: device.hddCapacity || ""
            });
            setIsDeviceFormOpen(true);
        } else {
            setEditingDevice(null);
            setDeviceFormData({
                customerPurchasedProductId: null,
                deviceType: "Recording",
                deviceUsername: "",
                devicePassword: "",
                localIpAddress: "",
                macAddress: "",
                modemInfo: "",
                modemPassword: "",
                hasInternetMonitoring: false,
                serialNumber: "",
                qrCodeUrl: "",

                // New Fields
                modemSerialNumber: "",
                deviceImporter: "",
                deviceModel: "",
                materialNotes: "",

                deviceAddress: "",
                cameraNotes: "",
                hddSerialNumber: "",
                hddBrand: "",
                hddImporter: "",
                hddCapacity: ""
            });
            setIsDeviceFormOpen(false);
        }
        setShowDeviceModal(true);
    };


    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("tr-TR", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Başlık */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 mb-1">Müşteriler</h1>
                    <p className="text-sm text-slate-600">
                        Kayıtlı müşterilerinizi buradan görüntüleyebilirsiniz.
                    </p>
                </div>
                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Ara (İsim, E-posta, Tel)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[250px] bg-white text-slate-900"
                    />
                    <button
                        onClick={handleExport}
                        className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        JSON İndir
                    </button>
                    <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
                    >
                        {showCreateForm ? "İptal" : "+ Yeni Müşteri"}
                    </button>
                </div>
            </div>

            {/* Customer List Tabs */}
            <div className="flex gap-4 mb-6 border-b border-slate-200">
                <button
                    onClick={() => setCustomerListTab('active')}
                    className={`px-4 py-2 font-medium text-sm transition-colors ${customerListTab === 'active'
                        ? 'text-emerald-600 border-b-2 border-emerald-600'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Aktif Müşteriler
                </button>
                <button
                    onClick={() => setCustomerListTab('deleted')}
                    className={`px-4 py-2 font-medium text-sm transition-colors ${customerListTab === 'deleted'
                        ? 'text-red-600 border-b-2 border-red-600'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Silinen Müşteriler
                </button>
            </div>

            {/* Create Form */}
            {showCreateForm && (
                <div className="mb-6 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-lg font-semibold mb-4 text-slate-800">Yeni Müşteri Ekle</h2>
                    <form onSubmit={handleCreateCustomer} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Ad Soyad *</label>
                            <input
                                type="text"
                                required
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">E-posta *</label>
                            <input
                                type="email"
                                required
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Telefon *</label>
                            <input
                                type="tel"
                                required
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Şifre *</label>
                            <input
                                type="password"
                                required
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="Müşteri için şifre"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">TC Kimlik No</label>
                            <input
                                type="text"
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white"
                                value={formData.tc}
                                onChange={(e) => setFormData({ ...formData, tc: e.target.value })}
                                placeholder="11 haneli TC numarası"
                                maxLength={11}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">VKN (Vergi Kimlik No)</label>
                            <input
                                type="text"
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white"
                                value={formData.vkn}
                                onChange={(e) => setFormData({ ...formData, vkn: e.target.value })}
                                placeholder="Vergi kimlik numarası"
                                maxLength={10}
                            />
                        </div>
                        <div className="md:col-span-2 border-t border-slate-200 pt-4 mt-2">
                            <h3 className="text-sm font-semibold text-slate-700 mb-3">Adres Bilgileri (Opsiyonel)</h3>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Adres Etiketi</label>
                            <input
                                type="text"
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white"
                                value={formData.addressLabel}
                                onChange={(e) => setFormData({ ...formData, addressLabel: e.target.value })}
                                placeholder="Ev, İş, vb."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Şehir</label>
                            <input
                                type="text"
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">İlçe</label>
                            <input
                                type="text"
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white"
                                value={formData.district}
                                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tam Adres</label>
                            <textarea
                                rows={3}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white"
                                value={formData.fullAddress}
                                onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
                                placeholder="Sokak, mahalle, bina no..."
                            />
                        </div>
                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition font-medium"
                            >
                                Müşteri Ekle
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Hata mesajı */}
            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                </div>
            )}

            {/* Loading durumu */}
            {loading && (
                <div className="text-center py-12">
                    <p className="text-slate-600">Müşteri listesi yükleniyor...</p>
                </div>
            )}

            {/* Tablo */}
            {!loading && !error && filteredCustomers.length > 0 && (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3">Ad Soyad</th>
                                <th className="px-6 py-3">Telefon</th>
                                <th className="px-6 py-3">Adres</th>
                                <th className="px-6 py-3">Durum</th>
                                <th className="px-6 py-3">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.map((customer) => (
                                <tr
                                    key={customer.id}
                                    className="border-t border-slate-200 hover:bg-slate-50 transition"
                                >
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        {customer.fullName}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{customer.phone}</td>
                                    <td className="px-6 py-4 text-slate-600 truncate max-w-[200px]" title={customer.defaultAddress}>
                                        {customer.defaultAddress || "-"}
                                    </td>

                                    <td className="px-6 py-4">
                                        {customer.isActive ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                                Aktif
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                                                Pasif
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="relative">
                                            <button
                                                onClick={() => setOpenDropdownId(openDropdownId === customer.id ? null : customer.id)}
                                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium flex items-center gap-1 transition"
                                            >
                                                Yönet
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>

                                            {openDropdownId === customer.id && (
                                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-10">
                                                    <div className="py-1">
                                                        <button
                                                            onClick={() => {
                                                                fetchCustomerDetails(customer);
                                                                setOpenDropdownId(null);
                                                            }}
                                                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                            Detay
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                handleEdit(customer);
                                                                setOpenDropdownId(null);
                                                            }}
                                                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                            Düzenle
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                fetchCustomerDevices(customer.id);
                                                                // Also fetch products for the dropdown
                                                                const token = getToken();
                                                                if (token) {
                                                                    fetch(`${API_BASE_URL}/api/customer-purchased-products/customer/${customer.id}`, {
                                                                        headers: { Authorization: `Bearer ${token}` }
                                                                    })
                                                                        .then(res => res.ok ? res.json() : [])
                                                                        .then(setCustomerProducts);
                                                                }
                                                                setShowDeviceModal(true);
                                                                setOpenDropdownId(null);
                                                            }}
                                                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                            </svg>
                                                            Cihaz Bilgileri
                                                        </button>

                                                        <button
                                                            onClick={() => {
                                                                handleDelete(customer.id, customer.fullName);
                                                                setOpenDropdownId(null);
                                                            }}
                                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-100"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                            Sil
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div >
            )
            }


            {/* Boş durum */}
            {
                !loading && !error && filteredCustomers.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                        <p className="text-slate-600">Henüz kayıtlı müşteri bulunmuyor.</p>
                    </div>
                )
            }

            {/* Detail Modal */}
            {
                selectedCustomer && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">{selectedCustomer.fullName}</h2>
                                    <p className="text-sm text-slate-500">Müşteri Detayları</p>
                                </div>
                                <button onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-slate-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div className="flex border-b border-slate-200 overflow-x-auto">
                                <button
                                    onClick={() => setDetailTab("profile")}
                                    className={`flex-1 min-w-[100px] py-3 text-sm font-medium whitespace-nowrap ${detailTab === "profile" ? "text-emerald-600 border-b-2 border-emerald-600" : "text-slate-500 hover:text-slate-700"}`}
                                >
                                    Profil
                                </button>
                                <button
                                    onClick={() => setDetailTab("jobs")}
                                    className={`flex-1 min-w-[100px] py-3 text-sm font-medium whitespace-nowrap ${detailTab === "jobs" ? "text-emerald-600 border-b-2 border-emerald-600" : "text-slate-500 hover:text-slate-700"}`}
                                >
                                    İşler ({customerJobs.length})
                                </button>
                                <button
                                    onClick={() => setDetailTab("finance")}
                                    className={`flex-1 min-w-[100px] py-3 text-sm font-medium whitespace-nowrap ${detailTab === "finance" ? "text-emerald-600 border-b-2 border-emerald-600" : "text-slate-500 hover:text-slate-700"}`}
                                >
                                    Finans
                                </button>
                                <button
                                    onClick={() => setDetailTab("addresses")}
                                    className={`flex-1 min-w-[100px] py-3 text-sm font-medium whitespace-nowrap ${detailTab === "addresses" ? "text-emerald-600 border-b-2 border-emerald-600" : "text-slate-500 hover:text-slate-700"}`}
                                >
                                    Adresler ({customerAddresses.length})
                                </button>
                                <button
                                    onClick={() => setDetailTab("products")}
                                    className={`flex-1 min-w-[100px] py-3 text-sm font-medium whitespace-nowrap ${detailTab === "products" ? "text-emerald-600 border-b-2 border-emerald-600" : "text-slate-500 hover:text-slate-700"}`}
                                >
                                    Ürünler ({customerProducts.length})
                                </button>
                                <button
                                    onClick={() => setDetailTab("invoices")}
                                    className={`flex-1 min-w-[100px] py-3 text-sm font-medium whitespace-nowrap ${detailTab === "invoices" ? "text-emerald-600 border-b-2 border-emerald-600" : "text-slate-500 hover:text-slate-700"}`}
                                >
                                    Fatura ({customerDocuments.filter((d: any) => d.type === 1).length})
                                </button>
                                <button
                                    onClick={() => setDetailTab("waybills")}
                                    className={`flex-1 min-w-[100px] py-3 text-sm font-medium whitespace-nowrap ${detailTab === "waybills" ? "text-emerald-600 border-b-2 border-emerald-600" : "text-slate-500 hover:text-slate-700"}`}
                                >
                                    İrsaliye ({customerDocuments.filter((d: any) => d.type === 2).length})
                                </button>
                                <button
                                    onClick={() => setDetailTab("offers")}
                                    className={`flex-1 min-w-[100px] py-3 text-sm font-medium whitespace-nowrap ${detailTab === "offers" ? "text-emerald-600 border-b-2 border-emerald-600" : "text-slate-500 hover:text-slate-700"}`}
                                >
                                    Teklifler ({customerDocuments.filter((d: any) => d.type === 3).length})
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto">
                                {detailsLoading ? (
                                    <div className="text-center py-8">Yükleniyor...</div>
                                ) : (
                                    <>
                                        {detailTab === "profile" && (
                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-xs text-slate-500 uppercase mb-1">E-posta</label>
                                                    <p className="text-slate-800 font-medium">{selectedCustomer.email}</p>
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-slate-500 uppercase mb-1">Telefon</label>
                                                    <p className="text-slate-800 font-medium">{selectedCustomer.phone}</p>
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-slate-500 uppercase mb-1">Kayıt Tarihi</label>
                                                    <p className="text-slate-800 font-medium">{formatDate(selectedCustomer.createdAt)}</p>
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-slate-500 uppercase mb-1">Durum</label>
                                                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${selectedCustomer.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                                                        {selectedCustomer.isActive ? "Aktif" : "Pasif"}
                                                    </span>
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-slate-500 uppercase mb-1">TC Kimlik No</label>
                                                    <p className="text-slate-800 font-medium">{selectedCustomer.tc || "-"}</p>
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-slate-500 uppercase mb-1">VKN (Vergi No)</label>
                                                    <p className="text-slate-800 font-medium">{selectedCustomer.vkn || "-"}</p>
                                                </div>
                                                <div className="col-span-2 border-t border-slate-100 pt-4 mt-2">
                                                    <label className="block text-xs text-slate-500 uppercase mb-1">Varsayılan Adres</label>
                                                    {customerAddresses.find((a: any) => a.isDefault) ? (
                                                        <div>
                                                            <p className="text-slate-800 font-medium">
                                                                {customerAddresses.find((a: any) => a.isDefault).fullAddress}
                                                            </p>
                                                            <p className="text-sm text-slate-500">
                                                                {customerAddresses.find((a: any) => a.isDefault).district} / {customerAddresses.find((a: any) => a.isDefault).city}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <p className="text-slate-400 italic">Varsayılan adres belirtilmemiş.</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {detailTab === "jobs" && (
                                            <div className="space-y-4">
                                                {customerJobs.length === 0 ? (
                                                    <p className="text-center text-slate-500 py-4">Kayıtlı iş bulunamadı.</p>
                                                ) : (
                                                    customerJobs.map((job: any) => (
                                                        <div key={job.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <h4 className="font-semibold text-slate-800">{job.title}</h4>
                                                                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                                                    {["Bekliyor", "Planlandı", "Devam Ediyor", "Tamamlandı", "İptal"][job.status]}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-slate-600 mb-2">{job.description}</p>
                                                            <div className="flex justify-between text-xs text-slate-500">
                                                                <span>Personel: {job.assignedPersonnelName || "-"}</span>
                                                                <span>Tutar: {job.estimatedCost?.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</span>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        )}

                                        {detailTab === "finance" && (
                                            <div>
                                                {customerBalance && (
                                                    <div className="space-y-4 mb-6">
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                            <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                                                                <p className="text-xs text-red-600 uppercase font-semibold mb-1">Toplam Borç</p>
                                                                <p className="text-xl font-bold text-red-700">
                                                                    {(customerBalance.totalDebt || customerBalance.totalExpense || 0).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                                                                </p>
                                                            </div>
                                                            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                                                                <p className="text-xs text-emerald-600 uppercase font-semibold mb-1">Toplam Ödenen</p>
                                                                <p className="text-xl font-bold text-emerald-700">
                                                                    {(customerBalance.totalPaid || customerBalance.totalIncome || 0).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                                                                </p>
                                                            </div>
                                                            <div className={`p-4 rounded-lg border ${(customerBalance.currentBalance || customerBalance.totalBalance || 0) > 0 ? 'bg-orange-50 border-orange-100' : 'bg-slate-50 border-slate-100'}`}>
                                                                <p className="text-xs uppercase font-semibold mb-1" style={{ color: (customerBalance.currentBalance || customerBalance.totalBalance || 0) > 0 ? '#ea580c' : '#64748b' }}>
                                                                    {(customerBalance.currentBalance || customerBalance.totalBalance || 0) > 0 ? 'Kalan Borç' : 'Bakiye'}
                                                                </p>
                                                                <p className={`text-xl font-bold ${(customerBalance.currentBalance || customerBalance.totalBalance || 0) > 0 ? 'text-orange-700' : 'text-slate-700'}`}>
                                                                    {(customerBalance.currentBalance || customerBalance.totalBalance || 0).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                                                                </p>
                                                            </div>
                                                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                                                <p className="text-xs text-blue-600 uppercase font-semibold mb-1">Son Güncelleme</p>
                                                                <p className="text-sm font-medium text-blue-700">
                                                                    {customerBalance.lastUpdated ? new Date(customerBalance.lastUpdated).toLocaleDateString("tr-TR", {
                                                                        day: 'numeric',
                                                                        month: 'short',
                                                                        year: 'numeric'
                                                                    }) : '-'}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Ek Detaylar */}
                                                        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                                                            <div>
                                                                <p className="text-xs text-slate-500 mb-1">Alacak Tutarı</p>
                                                                <p className="text-base font-semibold text-slate-800">
                                                                    {((customerBalance.totalDebt || customerBalance.totalExpense || 0) - (customerBalance.totalPaid || customerBalance.totalIncome || 0) > 0
                                                                        ? (customerBalance.totalDebt || customerBalance.totalExpense || 0) - (customerBalance.totalPaid || customerBalance.totalIncome || 0)
                                                                        : 0
                                                                    ).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-slate-500 mb-1">Verecek Tutarı</p>
                                                                <p className="text-base font-semibold text-slate-800">
                                                                    {((customerBalance.totalPaid || customerBalance.totalIncome || 0) - (customerBalance.totalDebt || customerBalance.totalExpense || 0) > 0
                                                                        ? (customerBalance.totalPaid || customerBalance.totalIncome || 0) - (customerBalance.totalDebt || customerBalance.totalExpense || 0)
                                                                        : 0
                                                                    ).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-slate-500 mb-1">En Son Ödeme Tarihi</p>
                                                                <p className="text-base font-semibold text-slate-800">
                                                                    {customerTransactions.length > 0
                                                                        ? new Date(customerTransactions.filter((tx: any) => tx.type === 0)[0]?.createdAt || customerTransactions[0].createdAt).toLocaleDateString("tr-TR", {
                                                                            day: 'numeric',
                                                                            month: 'long',
                                                                            year: 'numeric'
                                                                        })
                                                                        : 'Henüz ödeme yok'
                                                                    }
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-slate-500 mb-1">Toplam İşlem Sayısı</p>
                                                                <p className="text-base font-semibold text-slate-800">{customerTransactions.length} işlem</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                    </svg>
                                                    Hareket Geçmişi
                                                </h4>
                                                <div className="space-y-2">
                                                    {customerTransactions.length === 0 ? (
                                                        <p className="text-center text-slate-500 py-8 bg-slate-50 rounded-lg">İşlem bulunamadı.</p>
                                                    ) : (
                                                        customerTransactions.map((tx: any) => (
                                                            <div key={tx.id} className="flex justify-between items-start p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <p className="text-sm font-semibold text-slate-800">{tx.description}</p>
                                                                        {tx.jobTitle && (
                                                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                                                                İş: {tx.jobTitle}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex gap-4 text-xs text-slate-500">
                                                                        <span>📅 {new Date(tx.createdAt).toLocaleDateString("tr-TR", { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                                        {tx.referenceNumber && (
                                                                            <span>🔖 Ref: {tx.referenceNumber}</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="text-right ml-4">
                                                                    <span className={`text-lg font-bold ${tx.type === 0 ? "text-emerald-600" : "text-red-600"}`}>
                                                                        {tx.type === 0 ? "+" : "-"}{tx.amount.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                                                                    </span>
                                                                    <p className="text-xs text-slate-500 mt-1">
                                                                        {tx.type === 0 ? "Ödeme" : "Borç"}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {detailTab === "addresses" && (
                                            <div>
                                                <div className="flex justify-between items-center mb-4">
                                                    <h4 className="font-semibold text-slate-800">Adresler</h4>
                                                    <button
                                                        onClick={() => setShowAddressForm(!showAddressForm)}
                                                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition"
                                                    >
                                                        {showAddressForm ? "İptal" : "+ Yeni Adres"}
                                                    </button>
                                                </div>

                                                {showAddressForm && (
                                                    <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                                        <h5 className="font-medium text-slate-800 mb-3">Yeni Adres Ekle</h5>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="block text-sm text-slate-600 mb-1">Etiket</label>
                                                                <input
                                                                    type="text"
                                                                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                                                                    value={newAddress.label}
                                                                    onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                                                                    placeholder="Ev, İş, vb."
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm text-slate-600 mb-1">Şehir</label>
                                                                <input
                                                                    type="text"
                                                                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                                                                    value={newAddress.city}
                                                                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm text-slate-600 mb-1">İlçe</label>
                                                                <input
                                                                    type="text"
                                                                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                                                                    value={newAddress.district}
                                                                    onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm text-slate-600 mb-1">Posta Kodu</label>
                                                                <input
                                                                    type="text"
                                                                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                                                                    value={newAddress.postalCode}
                                                                    onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="col-span-2">
                                                                <label className="block text-sm text-slate-600 mb-1">Tam Adres</label>
                                                                <textarea
                                                                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                                                                    rows={2}
                                                                    value={newAddress.fullAddress}
                                                                    onChange={(e) => setNewAddress({ ...newAddress, fullAddress: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="col-span-2">
                                                                <label className="block text-sm text-slate-600 mb-1">Notlar</label>
                                                                <textarea
                                                                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                                                                    rows={2}
                                                                    value={newAddress.notes}
                                                                    onChange={(e) => setNewAddress({ ...newAddress, notes: e.target.value })}
                                                                    placeholder="Adres ile ilgili notlar (opsiyonel)"
                                                                />
                                                            </div>
                                                            <div className="col-span-2">
                                                                <button
                                                                    onClick={async () => {
                                                                        const token = getToken();
                                                                        if (!token || !selectedCustomer) return;

                                                                        try {
                                                                            if (editingAddress) {
                                                                                // Update existing address
                                                                                const response = await fetch(`${API_BASE_URL}/api/customer/addresses/${editingAddress.id}`, {
                                                                                    method: 'PUT',
                                                                                    headers: {
                                                                                        'Content-Type': 'application/json',
                                                                                        Authorization: `Bearer ${token}`
                                                                                    },
                                                                                    body: JSON.stringify(newAddress)
                                                                                });
                                                                                if (response.ok) {
                                                                                    alert('Adres güncellendi!');
                                                                                    setEditingAddress(null);
                                                                                    setShowAddressForm(false);
                                                                                    setNewAddress({ label: "Ev", city: "", district: "", fullAddress: "", postalCode: "", notes: "" });
                                                                                    const addrRes = await fetch(`${API_BASE_URL}/api/customer/addresses/customer/${selectedCustomer.id}`, {
                                                                                        headers: { Authorization: `Bearer ${token}` }
                                                                                    });
                                                                                    if (addrRes.ok) setCustomerAddresses(await addrRes.json());
                                                                                } else {
                                                                                    alert('Güncelleme başarısız.');
                                                                                }
                                                                            } else {
                                                                                // Create new address
                                                                                const response = await fetch(`${API_BASE_URL}/api/customer/addresses`, {
                                                                                    method: 'POST',
                                                                                    headers: {
                                                                                        'Content-Type': 'application/json',
                                                                                        Authorization: `Bearer ${token}`
                                                                                    },
                                                                                    body: JSON.stringify({
                                                                                        customerId: selectedCustomer.id,
                                                                                        ...newAddress
                                                                                    })
                                                                                });
                                                                                if (response.ok) {
                                                                                    alert('Adres eklendi!');
                                                                                    setShowAddressForm(false);
                                                                                    setNewAddress({ label: "Ev", city: "", district: "", fullAddress: "", postalCode: "", notes: "" });
                                                                                    const addrRes = await fetch(`${API_BASE_URL}/api/customer/addresses/customer/${selectedCustomer.id}`, {
                                                                                        headers: { Authorization: `Bearer ${token}` }
                                                                                    });
                                                                                    if (addrRes.ok) setCustomerAddresses(await addrRes.json());
                                                                                } else {
                                                                                    alert('Adres eklenemedi.');
                                                                                }
                                                                            }
                                                                        } catch (error) {
                                                                            console.error(error);
                                                                            alert('Bir hata oluştu.');
                                                                        }
                                                                    }}
                                                                    className="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 transition"
                                                                >
                                                                    {editingAddress ? 'Adresi Güncelle' : 'Adresi Kaydet'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="space-y-4">
                                                    {customerAddresses.length === 0 ? (
                                                        <p className="text-center text-slate-500 py-4">Kayıtlı adres bulunamadı.</p>
                                                    ) : (
                                                        customerAddresses.map((addr: any) => (
                                                            <div key={addr.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50">
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <div>
                                                                        <h4 className="font-semibold text-slate-800">{addr.label}</h4>
                                                                        {addr.isDefault && (
                                                                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">Varsayılan</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            onClick={() => {
                                                                                setEditingAddress(addr);
                                                                                setNewAddress({
                                                                                    label: addr.label,
                                                                                    city: addr.city,
                                                                                    district: addr.district,
                                                                                    fullAddress: addr.fullAddress,
                                                                                    postalCode: addr.postalCode || "",
                                                                                    notes: addr.notes || ""
                                                                                });
                                                                                setShowAddressForm(true);
                                                                            }}
                                                                            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium px-2 py-1 bg-emerald 50 hover:bg-emerald-100 rounded transition"
                                                                        >
                                                                            Düzenle
                                                                        </button>
                                                                        <button
                                                                            onClick={async () => {
                                                                                if (!confirm('Bu adresi silmek istediğinizden emin misiniz?')) return;
                                                                                const token = getToken();
                                                                                if (!token || !selectedCustomer) return;
                                                                                try {
                                                                                    const response = await fetch(`${API_BASE_URL}/api/customer/addresses/${addr.id}`, {
                                                                                        method: 'DELETE',
                                                                                        headers: { Authorization: `Bearer ${token}` }
                                                                                    });
                                                                                    if (response.ok) {
                                                                                        alert('Adres silindi.');
                                                                                        const addrRes = await fetch(`${API_BASE_URL}/api/customer/addresses/customer/${selectedCustomer.id}`, {
                                                                                            headers: { Authorization: `Bearer ${token}` }
                                                                                        });
                                                                                        if (addrRes.ok) setCustomerAddresses(await addrRes.json());
                                                                                    } else {
                                                                                        alert('Silme başarısız.');
                                                                                    }
                                                                                } catch (error) {
                                                                                    console.error(error);
                                                                                    alert('Bir hata oluştu.');
                                                                                }
                                                                            }}
                                                                            className="text-xs text-red-600 hover:text-red-700 font-medium px-2 py-1 bg-red-50 hover:bg-red-100 rounded transition"
                                                                        >
                                                                            Sil
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                <p className="text-sm text-slate-600">{addr.fullAddress}</p>
                                                                <p className="text-xs text-slate-500 mt-1">{addr.district} / {addr.city}</p>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {detailTab === "products" && (
                                            <div>
                                                <div className="flex justify-between items-center mb-4">
                                                    <h4 className="font-semibold text-slate-800">Müşteri Ürünleri</h4>
                                                    <button
                                                        onClick={() => setShowProductForm(!showProductForm)}
                                                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition"
                                                    >
                                                        + Yeni Ürün Ekle
                                                    </button>
                                                </div>

                                                {/* Product Form */}
                                                {showProductForm && (
                                                    <div className="mb-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                                                        <h5 className="font-semibold text-slate-800 mb-3">Yeni Ürün Ekle</h5>

                                                        {/* Entry Mode Toggle */}
                                                        <div className="flex gap-4 mb-4 border-b border-slate-200 pb-2">
                                                            <label className="flex items-center gap-2 cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    name="entryMode"
                                                                    checked={productEntryMode === 'select'}
                                                                    onChange={() => {
                                                                        setProductEntryMode('select');
                                                                        setProductFormData({ ...productFormData, productId: null, productName: "", unitPrice: 0 });
                                                                        setSelectedCategoryId(null);
                                                                        setSelectedProductId(null);
                                                                    }}
                                                                    className="text-emerald-600 focus:ring-emerald-500"
                                                                />
                                                                <span className="text-sm font-medium text-slate-700">Listeden Seç</span>
                                                            </label>
                                                            <label className="flex items-center gap-2 cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    name="entryMode"
                                                                    checked={productEntryMode === 'manual'}
                                                                    onChange={() => {
                                                                        setProductEntryMode('manual');
                                                                        setProductFormData({ ...productFormData, productId: null, productName: "", unitPrice: 0 });
                                                                    }}
                                                                    className="text-emerald-600 focus:ring-emerald-500"
                                                                />
                                                                <span className="text-sm font-medium text-slate-700">Manuel Giriş</span>
                                                            </label>
                                                        </div>

                                                        <form onSubmit={handleProductCreate} className="grid grid-cols-2 gap-4">
                                                            {productEntryMode === 'select' ? (
                                                                <>
                                                                    <div className="col-span-2">
                                                                        <label className="block text-sm font-medium text-slate-700 mb-1">Kategori Seçiniz</label>
                                                                        <select
                                                                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white"
                                                                            value={selectedCategoryId || ""}
                                                                            onChange={(e) => {
                                                                                setSelectedCategoryId(parseInt(e.target.value) || null);
                                                                                setSelectedProductId(null);
                                                                            }}
                                                                        >
                                                                            <option value="">Kategori Seçiniz</option>
                                                                            {categories.map((cat: any) => (
                                                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                    <div className="col-span-2">
                                                                        <label className="block text-sm font-medium text-slate-700 mb-1">Ürün Seçiniz</label>
                                                                        <select
                                                                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white"
                                                                            value={selectedProductId || ""}
                                                                            onChange={(e) => {
                                                                                const pId = parseInt(e.target.value);
                                                                                const product = products.find(p => p.id === pId);
                                                                                if (product) {
                                                                                    setSelectedProductId(pId);
                                                                                    setProductFormData({
                                                                                        ...productFormData,
                                                                                        productId: product.id,
                                                                                        productName: product.name,
                                                                                        unitPrice: product.price
                                                                                    });
                                                                                }
                                                                            }}
                                                                            disabled={!selectedCategoryId}
                                                                        >
                                                                            <option value="">Ürün Seçiniz</option>
                                                                            {products
                                                                                .filter((p: any) => !selectedCategoryId || p.categoryId === selectedCategoryId)
                                                                                .map((prod: any) => (
                                                                                    <option key={prod.id} value={prod.id}>{prod.name} - {prod.price} TL</option>
                                                                                ))}
                                                                        </select>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <div className="col-span-2">
                                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Ürün Adı *</label>
                                                                    <input
                                                                        type="text"
                                                                        required
                                                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white"
                                                                        value={productFormData.productName}
                                                                        onChange={(e) => setProductFormData({ ...productFormData, productName: e.target.value })}
                                                                    />
                                                                </div>
                                                            )}

                                                            <div>
                                                                <label className="block text-sm font-medium text-slate-700 mb-1">Miktar *</label>
                                                                <input
                                                                    type="number"
                                                                    required
                                                                    min="1"
                                                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white"
                                                                    value={productFormData.quantity}
                                                                    onChange={(e) => setProductFormData({ ...productFormData, quantity: parseInt(e.target.value) })}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-slate-700 mb-1">Birim Fiyat *</label>
                                                                <input
                                                                    type="number"
                                                                    required
                                                                    min="0"
                                                                    step="0.01"
                                                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white"
                                                                    value={productFormData.unitPrice}
                                                                    onChange={(e) => setProductFormData({ ...productFormData, unitPrice: parseFloat(e.target.value) })}
                                                                />
                                                            </div>
                                                            <div className="col-span-2">
                                                                <label className="block text-sm font-medium text-slate-700 mb-1">Seri Numarası</label>
                                                                <input
                                                                    type="text"
                                                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white"
                                                                    value={productFormData.serialNumber}
                                                                    onChange={(e) => setProductFormData({ ...productFormData, serialNumber: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="col-span-2">
                                                                <label className="block text-sm font-medium text-slate-700 mb-1">Notlar</label>
                                                                <textarea
                                                                    rows={2}
                                                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white"
                                                                    value={productFormData.notes}
                                                                    onChange={(e) => setProductFormData({ ...productFormData, notes: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="col-span-2">
                                                                <label className="block text-sm font-medium text-slate-700 mb-1">Satın Alma Tarihi *</label>
                                                                <input
                                                                    type="date"
                                                                    required
                                                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white"
                                                                    value={productFormData.purchaseDate}
                                                                    onChange={(e) => setProductFormData({ ...productFormData, purchaseDate: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="col-span-2 flex gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowProductForm(false)}
                                                                    className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-lg hover:bg-slate-300 transition"
                                                                >
                                                                    İptal
                                                                </button>
                                                                <button
                                                                    type="submit"
                                                                    className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition"
                                                                >
                                                                    Ürünü Ekle
                                                                </button>
                                                            </div>
                                                        </form>
                                                    </div>
                                                )}

                                                {/* Products List - Grouped by Date */}
                                                <div className="space-y-4">
                                                    {customerProducts.length === 0 ? (
                                                        <p className="text-center text-slate-500 py-4">Kayıtlı ürün bulunamadı.</p>
                                                    ) : (() => {
                                                        // Group products by purchase date
                                                        const groupedByDate = customerProducts.reduce((acc: any, prod: any) => {
                                                            const date = prod.purchaseDate ? new Date(prod.purchaseDate).toLocaleDateString('tr-TR') : 'Tarih Belirtilmemiş';
                                                            if (!acc[date]) acc[date] = [];
                                                            acc[date].push(prod);
                                                            return acc;
                                                        }, {});

                                                        // Track which date groups are expanded
                                                        // const [expandedDates, setExpandedDates] = React.useState<Set<string>>(new Set(Object.keys(groupedByDate)));

                                                        return Object.keys(groupedByDate).sort((a, b) => {
                                                            if (a === 'Tarih Belirtilmemiş') return 1;
                                                            if (b === 'Tarih Belirtilmemiş') return -1;
                                                            const dateA = new Date(a.split('.').reverse().join('-'));
                                                            const dateB = new Date(b.split('.').reverse().join('-'));
                                                            return dateB.getTime() - dateA.getTime();
                                                        }).map((date) => (
                                                            <div key={date} className="border border-slate-200 rounded-lg overflow-hidden">
                                                                <button
                                                                    onClick={() => {
                                                                        const newExpanded = new Set(expandedProductDates);
                                                                        if (newExpanded.has(date)) {
                                                                            newExpanded.delete(date);
                                                                        } else {
                                                                            newExpanded.add(date);
                                                                        }
                                                                        setExpandedProductDates(newExpanded);
                                                                    }}
                                                                    className="w-full p-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition"
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <svg
                                                                            className={`w-5 h-5 text-slate-500 transform transition-transform ${expandedProductDates.has(date) ? 'rotate-90' : ''}`}
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            viewBox="0 0 24 24"
                                                                        >
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                                        </svg>
                                                                        <span className="font-semibold text-slate-800">{date}</span>
                                                                        <span className="text-sm bg-slate-200 text-slate-600 px-2 py-1 rounded">
                                                                            {groupedByDate[date].length} Ürün
                                                                        </span>
                                                                    </div>
                                                                </button>

                                                                {expandedProductDates.has(date) && (
                                                                    <div className="p-4 space-y-3 bg-white">
                                                                        {groupedByDate[date].map((prod: any) => (
                                                                            <div key={prod.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 group relative">
                                                                                <div className="flex justify-between items-start mb-2">
                                                                                    <h4 className="font-semibold text-slate-800">{prod.productName}</h4>
                                                                                    <div className="flex items-center gap-2">
                                                                                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                                                                            {prod.quantity} Adet
                                                                                        </span>
                                                                                        <button
                                                                                            onClick={() => handleProductDelete(prod.id)}
                                                                                            className="opacity-0 group-hover:opacity-100 bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 transition"
                                                                                        >
                                                                                            Sil
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                                                                                    <div>
                                                                                        <span className="text-slate-400 text-xs block">Seri No</span>
                                                                                        {prod.serialNumber || "-"}
                                                                                    </div>
                                                                                    <div>
                                                                                        <span className="text-slate-400 text-xs block">Satış Tarihi</span>
                                                                                        {prod.purchaseDate ? new Date(prod.purchaseDate).toLocaleDateString("tr-TR") : "-"}
                                                                                    </div>
                                                                                    <div>
                                                                                        <span className="text-slate-400 text-xs block">Birim Fiyat</span>
                                                                                        {prod.unitPrice.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                                                                                    </div>
                                                                                    <div>
                                                                                        <span className="text-slate-400 text-xs block">Toplam</span>
                                                                                        {prod.totalPrice.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                                                                                    </div>
                                                                                </div>
                                                                                {prod.notes && (
                                                                                    <p className="text-xs text-slate-500 mt-2 border-t border-slate-100 pt-2">
                                                                                        Not: {prod.notes}
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ));
                                                    })()}
                                                </div>
                                            </div>
                                        )}

                                        {/* Fatura Tab */}
                                        {detailTab === "invoices" && (
                                            <div>
                                                <div className="mb-4">
                                                    <label className="block mb-2 text-sm font-medium text-slate-700">
                                                        Fatura Yükle (Resim)
                                                    </label>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleDocumentUpload(e, 1)}
                                                        disabled={uploadingDoc}
                                                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 disabled:opacity-50"
                                                    />
                                                    {uploadingDoc && <p className="text-xs text-slate-500 mt-1">Yükleniyor...</p>}
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                    {customerDocuments.filter((doc: any) => doc.type === 1).map((doc: any) => (
                                                        <div key={doc.id} className="relative group border rounded-lg overflow-hidden">
                                                            <img src={doc.fileUrl} alt="Fatura" className="w-full h-48 object-cover" />
                                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                                                                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="bg-white text-slate-800 px-3 py-1 rounded text-sm font-medium">Görüntüle</a>
                                                                <button onClick={() => handleDocumentDelete(doc.id)} className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium">Sil</button>
                                                            </div>
                                                            <div className="p-2 bg-slate-50">
                                                                <p className="text-xs text-slate-500">{new Date(doc.uploadedAt).toLocaleDateString("tr-TR")}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                {customerDocuments.filter((doc: any) => doc.type === 1).length === 0 && (
                                                    <p className="text-center text-slate-500 py-8 bg-slate-50 rounded-lg">Henüz fatura yüklenmemiş.</p>
                                                )}
                                            </div>
                                        )}

                                        {/* İrsaliye Tab */}
                                        {detailTab === "waybills" && (
                                            <div>
                                                <div className="mb-4">
                                                    <label className="block mb-2 text-sm font-medium text-slate-700">
                                                        İrsaliye Yükle (Resim)
                                                    </label>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleDocumentUpload(e, 2)}
                                                        disabled={uploadingDoc}
                                                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 disabled:opacity-50"
                                                    />
                                                    {uploadingDoc && <p className="text-xs text-slate-500 mt-1">Yükleniyor...</p>}
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                    {customerDocuments.filter((doc: any) => doc.type === 2).map((doc: any) => (
                                                        <div key={doc.id} className="relative group border rounded-lg overflow-hidden">
                                                            <img src={doc.fileUrl} alt="İrsaliye" className="w-full h-48 object-cover" />
                                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                                                                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="bg-white text-slate-800 px-3 py-1 rounded text-sm font-medium">Görüntüle</a>
                                                                <button onClick={() => handleDocumentDelete(doc.id)} className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium">Sil</button>
                                                            </div>
                                                            <div className="p-2 bg-slate-50">
                                                                <p className="text-xs text-slate-500">{new Date(doc.uploadedAt).toLocaleDateString("tr-TR")}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                {customerDocuments.filter((doc: any) => doc.type === 2).length === 0 && (
                                                    <p className="text-center text-slate-500 py-8 bg-slate-50 rounded-lg">Henüz irsaliye yüklenmemiş.</p>
                                                )}
                                            </div>
                                        )}

                                        {/* Teklifler Tab */}
                                        {detailTab === "offers" && (
                                            <div>
                                                <div className="mb-4">
                                                    <label className="block mb-2 text-sm font-medium text-slate-700">
                                                        Teklif Yükle (Resim)
                                                    </label>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleDocumentUpload(e, 3)}
                                                        disabled={uploadingDoc}
                                                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 disabled:opacity-50"
                                                    />
                                                    {uploadingDoc && <p className="text-xs text-slate-500 mt-1">Yükleniyor...</p>}
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                    {customerDocuments.filter((doc: any) => doc.type === 3).map((doc: any) => (
                                                        <div key={doc.id} className="relative group border rounded-lg overflow-hidden">
                                                            <img src={doc.fileUrl} alt="Teklif" className="w-full h-48 object-cover" />
                                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                                                                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="bg-white text-slate-800 px-3 py-1 rounded text-sm font-medium">Görüntüle</a>
                                                                <button onClick={() => handleDocumentDelete(doc.id)} className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium">Sil</button>
                                                            </div>
                                                            <div className="p-2 bg-slate-50">
                                                                <p className="text-xs text-slate-500">{new Date(doc.uploadedAt).toLocaleDateString("tr-TR")}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                {customerDocuments.filter((doc: any) => doc.type === 3).length === 0 && (
                                                    <p className="text-center text-slate-500 py-8 bg-slate-50 rounded-lg">Henüz teklif yüklenmemiş.</p>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Edit Modal */}
            {
                editingCustomer && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
                            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-slate-800">Müşteriyi Düzenle</h2>
                                <button onClick={() => setEditingCustomer(null)} className="text-slate-400 hover:text-slate-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <form onSubmit={handleUpdate} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Ad Soyad *</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white"
                                        value={editFormData.fullName}
                                        onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">E-posta *</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white"
                                        value={editFormData.email}
                                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Telefon *</label>
                                    <input
                                        type="tel"
                                        required
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white"
                                        value={editFormData.phone}
                                        onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">TC Kimlik No (Opsiyonel)</label>
                                    <input
                                        type="text"
                                        maxLength={11}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white"
                                        value={editFormData.tc}
                                        onChange={(e) => setEditFormData({ ...editFormData, tc: e.target.value })}
                                        placeholder="11 haneli TC numarası"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">VKN - Vergi No (Opsiyonel)</label>
                                    <input
                                        type="text"
                                        maxLength={10}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white"
                                        value={editFormData.vkn}
                                        onChange={(e) => setEditFormData({ ...editFormData, vkn: e.target.value })}
                                        placeholder="10 haneli vergi numarası"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={editFormData.isActive}
                                        onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                                        className="rounded border-slate-300"
                                    />
                                    <label htmlFor="isActive" className="text-sm font-medium text-slate-700">Aktif Müşteri</label>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setEditingCustomer(null)}
                                        className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-lg hover:bg-slate-300 transition font-medium"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                                    >
                                        Güncelle
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Customer Device Modal */}
            {
                showDeviceModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                                <h3 className="text-xl font-bold text-slate-800">Cihaz Bilgileri Yönetimi</h3>
                                <button onClick={() => setShowDeviceModal(false)} className="text-slate-400 hover:text-slate-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto flex-1">
                                {/* Form */}
                                <div className="mb-8 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => setIsDeviceFormOpen(!isDeviceFormOpen)}
                                        className="w-full p-6 flex items-center justify-between text-left hover:bg-slate-100 transition"
                                    >
                                        <span className="font-semibold text-slate-800 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            {editingDevice ? 'Cihaz Düzenle' : 'Yeni Cihaz Ekle'}
                                        </span>
                                        <svg
                                            className={`w-5 h-5 text-slate-500 transform transition-transform ${isDeviceFormOpen ? 'rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    {isDeviceFormOpen && (
                                        <div className="p-6 pt-0 border-t border-slate-200">
                                            <form onSubmit={handleDeviceSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 mb-1">Cihaz Tipi *</label>
                                                        <input
                                                            type="text"
                                                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white"
                                                            value={deviceFormData.deviceType}
                                                            onChange={(e) => setDeviceFormData({ ...deviceFormData, deviceType: e.target.value })}
                                                            required
                                                            placeholder="Örn: Kayıt Cihazı, Alarm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 mb-1">Cihaz Marka/Model</label>
                                                        <input
                                                            type="text"
                                                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white"
                                                            value={deviceFormData.deviceModel}
                                                            onChange={(e) => setDeviceFormData({ ...deviceFormData, deviceModel: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 mb-1">İthalatçı Firma</label>
                                                        <input
                                                            type="text"
                                                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white"
                                                            value={deviceFormData.deviceImporter}
                                                            onChange={(e) => setDeviceFormData({ ...deviceFormData, deviceImporter: e.target.value })}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Cihaz Adresi</label>
                                                    <input
                                                        type="text"
                                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white"
                                                        value={deviceFormData.deviceAddress}
                                                        onChange={(e) => setDeviceFormData({ ...deviceFormData, deviceAddress: e.target.value })}
                                                        placeholder="Cihazın fiziksel konumu"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Cihaz Kullanıcı Adı</label>
                                                    <input
                                                        type="text"
                                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white"
                                                        value={deviceFormData.deviceUsername}
                                                        onChange={(e) => setDeviceFormData({ ...deviceFormData, deviceUsername: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Cihaz Şifresi</label>
                                                    <input
                                                        type="text"
                                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white"
                                                        value={deviceFormData.devicePassword}
                                                        onChange={(e) => setDeviceFormData({ ...deviceFormData, devicePassword: e.target.value })}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Lokal IP Adresi</label>
                                                    <input
                                                        type="text"
                                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white"
                                                        value={deviceFormData.localIpAddress}
                                                        onChange={(e) => setDeviceFormData({ ...deviceFormData, localIpAddress: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">MAC Adresi</label>
                                                    <input
                                                        type="text"
                                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white"
                                                        value={deviceFormData.macAddress}
                                                        onChange={(e) => setDeviceFormData({ ...deviceFormData, macAddress: e.target.value })}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Seri Numarası</label>
                                                    <input
                                                        type="text"
                                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white"
                                                        value={deviceFormData.serialNumber}
                                                        onChange={(e) => setDeviceFormData({ ...deviceFormData, serialNumber: e.target.value })}
                                                    />
                                                </div>

                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Modem Bilgileri</label>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <input
                                                            type="text"
                                                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white"
                                                            value={deviceFormData.modemInfo}
                                                            onChange={(e) => setDeviceFormData({ ...deviceFormData, modemInfo: e.target.value })}
                                                            placeholder="Modem Marka/Model"
                                                        />
                                                        <input
                                                            type="text"
                                                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white"
                                                            value={deviceFormData.modemSerialNumber}
                                                            onChange={(e) => setDeviceFormData({ ...deviceFormData, modemSerialNumber: e.target.value })}
                                                            placeholder="Modem Seri No"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Modem Şifresi</label>
                                                    <input
                                                        type="text"
                                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white"
                                                        value={deviceFormData.modemPassword}
                                                        onChange={(e) => setDeviceFormData({ ...deviceFormData, modemPassword: e.target.value })}
                                                    />
                                                </div>



                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Açıklama(İş Anlatımı)</label>
                                                    <textarea
                                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white"
                                                        value={deviceFormData.cameraNotes}
                                                        onChange={(e) => setDeviceFormData({ ...deviceFormData, cameraNotes: e.target.value })}
                                                        rows={2}
                                                        placeholder="Yapılan iş ile ilgili açıklamalar"
                                                    />
                                                </div>

                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Malzeme Notu</label>
                                                    <textarea
                                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white"
                                                        value={deviceFormData.materialNotes}
                                                        onChange={(e) => setDeviceFormData({ ...deviceFormData, materialNotes: e.target.value })}
                                                        rows={2}
                                                        placeholder="Kullanılan malzeme vb. notlar"
                                                    />
                                                </div>

                                                <div className="md:col-span-2 border-t border-slate-200 pt-4 mt-2">
                                                    <h5 className="font-semibold text-slate-800 mb-3">HDD Bilgileri</h5>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">HDD Seri No</label>
                                                    <input
                                                        type="text"
                                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white"
                                                        value={deviceFormData.hddSerialNumber}
                                                        onChange={(e) => setDeviceFormData({ ...deviceFormData, hddSerialNumber: e.target.value })}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">HDD İthalatçı</label>
                                                    <input
                                                        type="text"
                                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white"
                                                        value={deviceFormData.hddImporter}
                                                        onChange={(e) => setDeviceFormData({ ...deviceFormData, hddImporter: e.target.value })}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">HDD Marka</label>
                                                    <input
                                                        type="text"
                                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white"
                                                        value={deviceFormData.hddBrand}
                                                        onChange={(e) => setDeviceFormData({ ...deviceFormData, hddBrand: e.target.value })}
                                                    />
                                                </div>

                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">HDD Hafızası</label>
                                                    <input
                                                        type="text"
                                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white"
                                                        value={deviceFormData.hddCapacity}
                                                        onChange={(e) => setDeviceFormData({ ...deviceFormData, hddCapacity: e.target.value })}
                                                        placeholder="Örn: 2TB, 4TB"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">QR Kod Görseli</label>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white"
                                                        onChange={(e) => setQrCodeFile(e.target.files ? e.target.files[0] : null)}
                                                    />
                                                    {deviceFormData.qrCodeUrl && (
                                                        <div className="mt-2">
                                                            <p className="text-xs text-slate-500 mb-1">Mevcut QR Kod:</p>
                                                            <a href={deviceFormData.qrCodeUrl} target="_blank" rel="noopener noreferrer" className="block w-24 h-24 border border-slate-200 rounded overflow-hidden hover:opacity-80 transition">
                                                                <img src={deviceFormData.qrCodeUrl} alt="QR Kod" className="w-full h-full object-cover" />
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="md:col-span-2 flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id="hasInternetMonitoring"
                                                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                                                        checked={deviceFormData.hasInternetMonitoring}
                                                        onChange={(e) => setDeviceFormData({ ...deviceFormData, hasInternetMonitoring: e.target.checked })}
                                                    />
                                                    <label htmlFor="hasInternetMonitoring" className="text-sm font-medium text-slate-700">İnternetten İzleme Var</label>
                                                </div>

                                                <div className="md:col-span-2 flex gap-3 mt-4">
                                                    {editingDevice && (
                                                        <button
                                                            type="button"
                                                            onClick={() => openDeviceModal()}
                                                            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition"
                                                        >
                                                            İptal
                                                        </button>
                                                    )}
                                                    <button
                                                        type="submit"
                                                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex-1"
                                                    >
                                                        {editingDevice ? 'Güncelle' : 'Kaydet'}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    )}
                                </div>

                                {/* Liste */}
                                <h4 className="font-semibold text-slate-800 mb-4">Kayıtlı Cihazlar</h4>
                                {customerDevices.length === 0 ? (
                                    <p className="text-slate-500 text-center py-8 bg-slate-50 rounded-lg border border-slate-200 border-dashed">
                                        Henüz cihaz bilgisi eklenmemiş.
                                    </p>
                                ) : (
                                    <div className="grid gap-4">
                                        {customerDevices.map((device) => (
                                            <div key={device.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition relative group">
                                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => openDeviceModal(device)}
                                                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                        title="Düzenle"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeviceDelete(device.id)}
                                                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                        title="Sil"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                                    {device.productName && (
                                                        <div className="col-span-2 md:col-span-3 pb-2 border-b border-slate-100 mb-2">
                                                            <span className="font-semibold text-emerald-700">{device.productName}</span>
                                                        </div>
                                                    )}
                                                    {device.deviceUsername && (
                                                        <div>
                                                            <span className="text-slate-500 block text-xs">Kullanıcı Adı</span>
                                                            <span className="font-medium text-slate-800">{device.deviceUsername}</span>
                                                        </div>
                                                    )}
                                                    {device.devicePassword && (
                                                        <div>
                                                            <span className="text-slate-500 block text-xs">Şifre</span>
                                                            <span className="font-medium text-slate-800">{device.devicePassword}</span>
                                                        </div>
                                                    )}
                                                    {device.localIpAddress && (
                                                        <div>
                                                            <span className="text-slate-500 block text-xs">IP Adresi</span>
                                                            <span className="font-medium text-slate-800">{device.localIpAddress}</span>
                                                        </div>
                                                    )}
                                                    {device.macAddress && (
                                                        <div>
                                                            <span className="text-slate-500 block text-xs">MAC Adresi</span>
                                                            <span className="font-medium text-slate-800">{device.macAddress}</span>
                                                        </div>
                                                    )}
                                                    {device.serialNumber && (
                                                        <div>
                                                            <span className="text-slate-500 block text-xs">Seri No</span>
                                                            <span className="font-medium text-slate-800">{device.serialNumber}</span>
                                                        </div>
                                                    )}
                                                    {device.modemInfo && (
                                                        <div className="col-span-2 md:col-span-3">
                                                            <span className="text-slate-500 block text-xs">Modem Bilgisi</span>
                                                            <span className="font-medium text-slate-800">{device.modemInfo}</span>
                                                        </div>
                                                    )}
                                                    {device.qrCodeUrl && (
                                                        <div className="col-span-2 md:col-span-3 mt-2">
                                                            <span className="text-slate-500 block text-xs mb-1">QR Kod</span>
                                                            <a href={device.qrCodeUrl} target="_blank" rel="noopener noreferrer" className="inline-block w-16 h-16 border border-slate-200 rounded overflow-hidden hover:opacity-80 transition">
                                                                <img src={device.qrCodeUrl} alt="QR Kod" className="w-full h-full object-cover" />
                                                            </a>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`w-2 h-2 rounded-full ${device.hasInternetMonitoring ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                                                        <span className="text-slate-600">İnternetten İzleme {device.hasInternetMonitoring ? 'Var' : 'Yok'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
