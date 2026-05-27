import React, { useEffect, useMemo, useState } from 'react';
import {
    defineDashboardExtension,
    Asset,
    AssetPickerDialog,
    Button,
    Page,
    PageBlock,
    PageLayout,
    PageTitle,
    VendureImage,
} from '@vendure/dashboard';
import { FileText, Image, Settings, Layers } from 'lucide-react';

interface BannerItem {
    id: string;
    title: string;
    subtitle: string | null;
    imageId: string | null;
    imagePreview: string | null;
    primaryButtonLabel: string | null;
    primaryButtonLink: string | null;
    secondaryButtonLabel: string | null;
    secondaryButtonLink: string | null;
    order: number;
}

type BannerFormValues = Omit<BannerItem, 'id'>;

const initialBannerForm: BannerFormValues = {
    title: '',
    subtitle: null,
    imageId: null,
    imagePreview: null,
    primaryButtonLabel: null,
    primaryButtonLink: null,
    secondaryButtonLabel: null,
    secondaryButtonLink: null,
    order: 0,
};

const getAuthToken = () => {
    if (typeof window === 'undefined') {
        return null;
    }
    return window.localStorage.getItem('vendure-auth-token');
};

const adminApi = async <T,>(query: string, variables?: Record<string, any>): Promise<T> => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    const token = getAuthToken();
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    const response = await fetch('/admin-api', {
        method: 'POST',
        headers,
        body: JSON.stringify({ query, variables }),
        credentials: 'include',
    });
    const json = await response.json();
    if (json.errors) {
        const msg = Array.isArray(json.errors)
            ? json.errors.map((e: any) => e.message).join('; ')
            : json.errors.message ?? 'GraphQL error';
        const err = new Error(msg);
        // attach full error payload for debugging
        (err as any).details = json.errors;
        throw err;
    }
    return json.data;
};

const GET_BANNERS = `
    query GetBanners {
        banners {
            items {
                id
                title
                subtitle
                image {
                    id
                    preview
                }
                primaryButtonLabel
                primaryButtonLink
                secondaryButtonLabel
                secondaryButtonLink
                order
            }
            totalItems
        }
    }
`;

const CREATE_BANNER = `
    mutation CreateBanner($input: CreateBannerInput!) {
        createBanner(input: $input) {
            id
        }
    }
`;

const UPDATE_BANNER = `
    mutation UpdateBanner($input: UpdateBannerInput!) {
        updateBanner(input: $input) {
            id
        }
    }
`;

const DELETE_BANNER = `
    mutation DeleteBanner($id: ID!) {
        deleteBanner(id: $id) {
            result
            message
        }
    }
`;

const normalizeBannerInput = (form: BannerFormValues) => ({
    title: form.title,
    subtitle: form.subtitle || null,
    imageId: form.imageId || null,
    primaryButtonLabel: form.primaryButtonLabel || null,
    primaryButtonLink: form.primaryButtonLink || null,
    secondaryButtonLabel: form.secondaryButtonLabel || null,
    secondaryButtonLink: form.secondaryButtonLink || null,
    order: form.order,
});

const LoginPageTitle = () => {
    useEffect(() => {
        document.title = 'Khukuri House';
    }, []);

    return (
        <div className="flex flex-col items-center text-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
                Welcome to Khukuri House
            </h1>
            <p className="text-sm text-muted-foreground">
                Sign in to access the admin dashboard
            </p>
        </div>
    );
};

const LoginLogo = () => null;

const BannerPage = () => {
    const [banners, setBanners] = useState<BannerItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [form, setForm] = useState<BannerFormValues>(initialBannerForm);
    const [assetPickerOpen, setAssetPickerOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [lastError, setLastError] = useState<string | null>(null);

    const selectedBanner = useMemo(
        () => banners.find((banner) => banner.id === selectedId) ?? null,
        [banners, selectedId],
    );

    useEffect(() => {
        if (selectedBanner) {
            setForm({
                title: selectedBanner.title,
                subtitle: selectedBanner.subtitle,
                imageId: selectedBanner.imageId,
                imagePreview: selectedBanner.imagePreview,
                primaryButtonLabel: selectedBanner.primaryButtonLabel,
                primaryButtonLink: selectedBanner.primaryButtonLink,
                secondaryButtonLabel: selectedBanner.secondaryButtonLabel,
                secondaryButtonLink: selectedBanner.secondaryButtonLink,
                order: selectedBanner.order,
            });
            setSelectedAsset(
                selectedBanner.imageId
                    ? ({ id: selectedBanner.imageId, preview: selectedBanner.imagePreview ?? '' } as Asset)
                    : null,
            );
        } else {
            setForm(initialBannerForm);
            setSelectedAsset(null);
        }
    }, [selectedBanner]);

    const loadBanners = async () => {
        setLoading(true);
        try {
            const result = await adminApi<{
                banners: {
                    items?: Array<{
                        id: string;
                        title: string;
                        subtitle: string | null;
                        image: { id: string; preview: string | null } | null;
                        primaryButtonLabel: string | null;
                        primaryButtonLink: string | null;
                        secondaryButtonLabel: string | null;
                        secondaryButtonLink: string | null;
                        order: number;
                    }>;
                    totalItems?: number;
                };
            }>(GET_BANNERS);

            const items = result.banners?.items ?? [];

            setBanners(
                items.map((item) => ({
                    id: item.id,
                    title: item.title,
                    subtitle: item.subtitle,
                    imageId: item.image?.id ?? null,
                    imagePreview: item.image?.preview ?? null,
                    primaryButtonLabel: item.primaryButtonLabel,
                    primaryButtonLink: item.primaryButtonLink,
                    secondaryButtonLabel: item.secondaryButtonLabel,
                    secondaryButtonLink: item.secondaryButtonLink,
                    order: item.order,
                })),
            );
        } catch (error) {
            console.error(error);
            const message = error instanceof Error ? error.message : 'Unable to load banners.';
            setLastError(message + ((error as any)?.details ? ' — ' + JSON.stringify((error as any).details) : ''));
            alert('Unable to load banners: ' + message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadBanners();
    }, []);

    const resetForm = () => {
        setSelectedId(null);
        setSelectedAsset(null);
        setForm(initialBannerForm);
    };

    const handleAssetSelect = (assets: Asset[]) => {
        const selected = assets[0];
        if (!selected) {
            return;
        }
        setSelectedAsset(selected);
        setForm((current) => ({
            ...current,
            imageId: selected.id,
            imagePreview: selected.preview ?? null,
        }));
        setAssetPickerOpen(false);
    };

    const GET_ASSETS = `
        query GetAssets($take: Int) {
            assets(options: { take: $take }) {
                items {
                    id
                    preview
                    name
                }
                totalItems
            }
        }
    `;

    const openAssetPicker = async () => {
        try {
            const res = await adminApi<{ assets: { items: { id: string; preview: string | null; name: string | null }[]; totalItems: number } }>(GET_ASSETS, { take: 1 });
            if (!res.assets || res.assets.totalItems === 0) {
                alert('No assets found. Upload assets in the Media/Assets area first.');
                return;
            }
            setAssetPickerOpen(true);
        } catch (err) {
            console.error('openAssetPicker error', err);
            alert('Unable to load assets: ' + (err instanceof Error ? err.message : String(err)));
        }
    };

    const saveBanner = async () => {
        if (!form.title.trim()) {
            alert('Please provide a banner title before saving.');
            return;
        }
        setSaving(true);
        try {
            const input = normalizeBannerInput(form);
            if (selectedId) {
                await adminApi<{ updateBanner: { id: string } }>(UPDATE_BANNER, {
                    input: { id: selectedId, ...input },
                });
            } else {
                await adminApi<{ createBanner: { id: string } }>(CREATE_BANNER, { input });
            }
            await loadBanners();
            resetForm();
        } catch (error) {
            console.error('saveBanner error', error);
            const message = error instanceof Error ? error.message : 'Unable to save banner.';
            setLastError(message);
            alert('Unable to save banner: ' + message);
        } finally {
            setSaving(false);
        }
    };

    const deleteBanner = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this banner?')) {
            return;
        }
        setSaving(true);
        try {
            await adminApi<{ deleteBanner: { result: string; message: string | null } }>(DELETE_BANNER, { id });
            await loadBanners();
            if (selectedId === id) {
                resetForm();
            }
        } catch (error) {
            console.error('deleteBanner error', error);
            const message = error instanceof Error ? error.message : 'Unable to delete banner.';
            setLastError(message);
            alert('Unable to delete banner: ' + message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Page pageId="banner-page">
            <PageTitle>Banners</PageTitle>
            <PageLayout>
                <PageBlock column="main" blockId="banner-list">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Banner List</h2>
                            <p style={{ margin: '8px 0 0', color: '#6b7280' }}>
                                Add, edit, or remove hero banners for the storefront.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={resetForm}
                            style={{
                                padding: '10px 16px',
                                backgroundColor: '#3b82f6',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: 6,
                                cursor: 'pointer',
                            }}
                        >
                            New banner
                        </button>
                    </div>
                    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
                        {loading ? (
                            <div style={{ padding: 24, color: '#6b7280' }}>Loading banners...</div>
                        ) : banners.length === 0 ? (
                            <div style={{ padding: 24, color: '#6b7280' }}>
                                No banners have been created yet.
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ backgroundColor: '#f9fafb' }}>
                                    <tr>
                                        <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>Title</th>
                                        <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>Subtitle</th>
                                        <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>Order</th>
                                        <th style={{ textAlign: 'right', padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {banners.map((banner) => (
                                        <tr key={banner.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                            <td style={{ padding: '12px 16px' }}>{banner.title}</td>
                                            <td style={{ padding: '12px 16px' }}>{banner.subtitle || '—'}</td>
                                            <td style={{ padding: '12px 16px' }}>{banner.order}</td>
                                            <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedId(banner.id)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        marginRight: 8,
                                                        backgroundColor: '#f3f4f6',
                                                        border: '1px solid #d1d5db',
                                                        borderRadius: 4,
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => deleteBanner(banner.id)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        backgroundColor: '#ef4444',
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: 4,
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </PageBlock>
                <PageBlock column="side" blockId="banner-form">
                    <div style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
                                    {selectedId ? 'Edit banner' : 'Create banner'}
                                </h3>
                                <p style={{ margin: '6px 0 0', color: '#6b7280' }}>
                                    Configure the banner that displays in the hero section.
                                </p>
                            </div>
                            {selectedId && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    style={{
                                        color: '#374151',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                        <div style={{ display: 'grid', gap: 12 }}>
                            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                Title
                                <input
                                    value={form.title}
                                    onChange={(event) => setForm({ ...form, title: event.target.value })}
                                    style={{ padding: 10, borderRadius: 6, border: '1px solid #d1d5db' }}
                                />
                            </label>
                            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                Subtitle
                                <input
                                    value={form.subtitle ?? ''}
                                    onChange={(event) => setForm({ ...form, subtitle: event.target.value || null })}
                                    style={{ padding: 10, borderRadius: 6, border: '1px solid #d1d5db' }}
                                />
                            </label>
                            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                Banner image
                                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                    <button
                                        type="button"
                                        onClick={() => void openAssetPicker()}
                                        style={{
                                            padding: '10px 16px',
                                            backgroundColor: '#3b82f6',
                                            color: '#ffffff',
                                            border: 'none',
                                            borderRadius: 6,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {selectedAsset ? 'Change image' : 'Select image'}
                                    </button>
                                    <div style={{ flex: 1, minWidth: 180 }}>
                                        <input
                                            value={form.imageId ?? ''}
                                            readOnly
                                            placeholder="Select an asset"
                                            style={{
                                                width: '100%',
                                                padding: 10,
                                                borderRadius: 6,
                                                border: '1px solid #d1d5db',
                                                backgroundColor: '#f9fafb',
                                            }}
                                        />
                                        {selectedAsset?.preview && (
                                            <div style={{ marginTop: 8, maxWidth: 260 }}>
                                                <img
                                                    src={selectedAsset.preview}
                                                    alt={selectedAsset?.name ?? 'Selected asset'}
                                                    style={{ width: '100%', borderRadius: 6, objectFit: 'cover', maxHeight: 160 }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </label>
                            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                Primary button label
                                <input
                                    value={form.primaryButtonLabel ?? ''}
                                    onChange={(event) => setForm({ ...form, primaryButtonLabel: event.target.value || null })}
                                    style={{ padding: 10, borderRadius: 6, border: '1px solid #d1d5db' }}
                                />
                            </label>
                            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                Primary button link
                                <input
                                    value={form.primaryButtonLink ?? ''}
                                    onChange={(event) => setForm({ ...form, primaryButtonLink: event.target.value || null })}
                                    style={{ padding: 10, borderRadius: 6, border: '1px solid #d1d5db' }}
                                />
                            </label>
                            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                Secondary button label
                                <input
                                    value={form.secondaryButtonLabel ?? ''}
                                    onChange={(event) => setForm({ ...form, secondaryButtonLabel: event.target.value || null })}
                                    style={{ padding: 10, borderRadius: 6, border: '1px solid #d1d5db' }}
                                />
                            </label>
                            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                Secondary button link
                                <input
                                    value={form.secondaryButtonLink ?? ''}
                                    onChange={(event) => setForm({ ...form, secondaryButtonLink: event.target.value || null })}
                                    style={{ padding: 10, borderRadius: 6, border: '1px solid #d1d5db' }}
                                />
                            </label>
                            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                Order
                                <input
                                    type="number"
                                    value={form.order}
                                    onChange={(event) => setForm({ ...form, order: parseInt(event.target.value, 10) || 0 })}
                                    style={{ padding: 10, borderRadius: 6, border: '1px solid #d1d5db' }}
                                />
                            </label>
                            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                <button
                                    type="button"
                                    onClick={saveBanner}
                                    disabled={saving}
                                    style={{
                                        padding: '10px 16px',
                                        backgroundColor: '#10b981',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: 6,
                                        cursor: 'pointer',
                                        opacity: saving ? 0.7 : 1,
                                    }}
                                >
                                    {saving ? 'Saving…' : 'Save banner'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    style={{
                                        padding: '10px 16px',
                                        backgroundColor: '#f3f4f6',
                                        border: '1px solid #d1d5db',
                                        borderRadius: 6,
                                        cursor: 'pointer',
                                    }}
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>
                </PageBlock>
            </PageLayout>
                <AssetPickerDialog
                    open={assetPickerOpen}
                    onClose={() => setAssetPickerOpen(false)}
                    onSelect={handleAssetSelect}
                    initialSelectedAssets={selectedAsset ? [selectedAsset] : []}
                />
                {lastError && (
                    <div style={{ position: 'fixed', left: 16, right: 16, bottom: 24, display: 'flex', justifyContent: 'center', zIndex: 9999 }}>
                        <div style={{ backgroundColor: '#fde68a', color: '#92400e', padding: '12px 16px', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', maxWidth: 960 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ flex: 1 }}>{lastError}</div>
                                <button onClick={() => setLastError(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>Dismiss</button>
                            </div>
                        </div>
                    </div>
                )}
        </Page>
    );
};

const PagesPage = () => (
    <Page pageId="pages-page">
        <PageTitle>Page</PageTitle>
        <PageLayout>
            <PageBlock column="main" blockId="pages-info">
                <h2 className="text-xl font-semibold">Page</h2>
                <p className="text-muted-foreground mt-2">
                    This page is a placeholder for future content page management.
                </p>
            </PageBlock>
        </PageLayout>
    </Page>
);

const SettingsPage = () => (
    <Page pageId="settings-page">
        <PageTitle>Site Setting</PageTitle>
        <PageLayout>
            <PageBlock column="main" blockId="settings-info">
                <h2 className="text-xl font-semibold">Site Setting</h2>
                <p className="text-muted-foreground mt-2">
                    This page is a placeholder for site settings management. It will be developed soon.
                </p>
            </PageBlock>
        </PageLayout>
    </Page>
);

export default defineDashboardExtension({
    navSections: [
        {
            id: 'content',
            title: 'Content',
            icon: Layers,
            order: 110,
        },
    ],
    routes: [
        {
            path: '/banners',
            component: () => <BannerPage />,
            navMenuItem: {
                id: 'banner',
                title: 'Banners',
                sectionId: 'content',
                icon: Image,
            },
        },
        {
            path: '/pages',
            component: () => <PagesPage />,
            navMenuItem: {
                id: 'page',
                title: 'Page',
                sectionId: 'content',
                icon: FileText,
            },
        },
        {
            path: '/settings',
            component: () => <SettingsPage />,
            navMenuItem: {
                id: 'site-setting',
                title: 'Site Setting',
                sectionId: 'content',
                icon: Settings,
            },
        },
    ],
    login: {
        logo: {
            component: LoginLogo,
        },
        beforeForm: {
            component: LoginPageTitle,
        },
    },
});
