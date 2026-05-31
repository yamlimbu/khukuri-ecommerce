import React, { useEffect, useState } from 'react';
import { fetchGraphQL } from './graphql';

const GET_PAGE = `
    query GetPage($id: ID!) {
        page(id: $id) {
            id
            title
            slug
            content
            featuredImageId: featuredImage { id }
            isPublished
        }
    }
`;

const CREATE_PAGE = `
    mutation CreatePage($input: CreatePageInput!) {
        createPage(input: $input) {
            id
        }
    }
`;

const UPDATE_PAGE = `
    mutation UpdatePage($input: UpdatePageInput!) {
        updatePage(input: $input) {
            id
        }
    }
`;

export const PageDetail = ({ id }: { id?: string }) => {
    const isNew = id === 'create';
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        content: '',
        featuredImageId: '',
        isPublished: false,
    });

    useEffect(() => {
        if (!isNew) {
            loadPage();
        }
    }, [id]);

    const loadPage = async () => {
        try {
            const data = await fetchGraphQL(GET_PAGE, { id });
            if (data.page) {
                setFormData({
                    title: data.page.title || '',
                    slug: data.page.slug || '',
                    content: data.page.content || '',
                    featuredImageId: data.page.featuredImageId?.id || '',
                    isPublished: data.page.isPublished || false,
                });
            }
        } catch (e) {
            console.error(e);
            alert('Error loading page');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const target = e.target as HTMLInputElement;
        const { name, value, type, checked } = target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (isNew) {
                await fetchGraphQL(CREATE_PAGE, { input: formData });
                window.location.hash = '/pages';
            } else {
                await fetchGraphQL(UPDATE_PAGE, { input: { id, ...formData } });
                window.location.hash = '/pages';
            }
        } catch (e: any) {
            console.error(e);
            alert('Error saving page: ' + e.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-6">Loading...</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <a href="#/pages" className="text-blue-600 hover:underline">&larr; Back to Pages</a>
                <h1 className="text-2xl font-bold">{isNew ? 'Create Page' : 'Edit Page'}</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow border border-gray-200 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Title <span className="text-red-500">*</span></label>
                        <input required type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500" />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Slug <span className="text-red-500">*</span></label>
                        <input required type="text" name="slug" value={formData.slug} onChange={handleChange} placeholder="e.g. about-us" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Featured Image Asset ID</label>
                    <input type="text" name="featuredImageId" value={formData.featuredImageId} onChange={handleChange} placeholder="e.g. 1" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Content <span className="text-red-500">*</span></label>
                    <textarea required name="content" rows={10} value={formData.content} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500"></textarea>
                </div>

                <div className="flex items-center">
                    <input type="checkbox" id="isPublished" name="isPublished" checked={formData.isPublished} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                    <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900">
                        Published
                    </label>
                </div>

                <div className="pt-4 border-t border-gray-200">
                    <button type="submit" disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
                        {saving ? 'Saving...' : 'Save Page'}
                    </button>
                </div>
            </form>
        </div>
    );
};
