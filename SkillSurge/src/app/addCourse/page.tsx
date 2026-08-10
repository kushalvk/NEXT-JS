'use client';

import React, {useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import toast from 'react-hot-toast';
import {addCourse} from '@/services/CourseService';
import PageHeader from '@/components/PageHeader';
import FileDropzone from '@/components/FileDropzone';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';

const MAX_VIDEO_SIZE = 30 * 1024 * 1024; // 30 MB, matching the API limit

const DEPARTMENTS = [
    'Web Development', 'Mobile Apps', 'Programming Languages', 'Game Development',
    'Entrepreneurship', 'Management', 'Sales', 'Business Strategy',
    'Accounting', 'Bookkeeping', 'Financial Analysis', 'Investing',
    'Cloud Computing', 'Cybersecurity', 'DevOps', 'Networking',
    'Microsoft Office', 'Google Workspace', 'Project Management', 'Data Entry',
    'Leadership', 'Time Management', 'Communication Skills', 'Mindfulness',
    'Graphic Design', 'UI/UX Design', '3D & Animation', 'Fashion Design',
    'Digital Marketing', 'SEO', 'Content Marketing', 'Social Media Marketing',
    'Yoga', 'Nutrition', 'Fitness Training', 'Mental Health',
    'Music Production', 'Guitar', 'Piano', 'Vocal Training',
];

const AddCoursePage: React.FC = () => {
    const router = useRouter();

    const [formData, setFormData] = useState({
        courseName: '',
        description: '',
        department: '',
        price: '',
        videoDescription: '',
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const setField = (field: keyof typeof formData, value: string) =>
        setFormData((prev) => ({...prev, [field]: value}));

    const handleImage = (file: File | null) => {
        setImageFile(file);

        if (!file) {
            setImagePreview(null);
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const {courseName, description, department, price, videoDescription} = formData;

        if (!courseName || !description || !department || !price || !videoFile || !videoDescription) {
            toast.error('Every field is required, including the first lesson.');
            return;
        }

        if (!imageFile) {
            toast.error('Please add a cover image.');
            return;
        }

        setIsSubmitting(true);
        const loadingToast = toast.loading('Uploading your course...');

        try {
            const form = new FormData();
            form.append('Course_Name', courseName);
            form.append('Description', description);
            form.append('Department', department);
            form.append('Price', price);
            form.append('Video', videoFile);
            form.append('Video_Description', videoDescription);
            form.append('Image', imageFile);

            const response = await addCourse(form);

            if (response?.success) {
                toast.success(response.message || 'Course published.', {id: loadingToast});
                router.push('/uploadCourse');
            } else {
                toast.dismiss(loadingToast);
                if (response?.message) toast.error(response.message);
            }
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong', {id: loadingToast});
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <PageHeader
                eyebrow="Teaching"
                title="Create a course"
                description="Publish a course with a cover image and your first lesson. You can add more lessons afterwards."
                actions={
                    <Button asChild variant="outline">
                        <Link href="/uploadCourse">My uploads</Link>
                    </Button>
                }
            />

            <div className="container-page page-shell">
                <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3 lg:gap-8">

                    <div className="min-w-0 space-y-6 lg:col-span-2">
                        {/* Course details */}
                        <section className="surface-card p-5 sm:p-6">
                            <h2 className="text-lg font-bold">Course details</h2>

                            <div className="mt-5 space-y-5">
                                <div>
                                    <label htmlFor="courseName" className="field-label">
                                        Course name<span className="ml-0.5 text-danger">*</span>
                                    </label>
                                    <Input
                                        id="courseName"
                                        value={formData.courseName}
                                        onChange={(e) => setField('courseName', e.target.value)}
                                        placeholder="e.g. Modern React from Scratch"
                                        maxLength={100}
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="description" className="field-label">
                                        Description<span className="ml-0.5 text-danger">*</span>
                                    </label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setField('description', e.target.value)}
                                        placeholder="What will students be able to do after this course?"
                                        rows={5}
                                        required
                                    />
                                    <p className="field-hint">A clear, specific summary converts better than a vague one.</p>
                                </div>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="department" className="field-label">
                                            Category<span className="ml-0.5 text-danger">*</span>
                                        </label>
                                        <Select
                                            value={formData.department}
                                            onValueChange={(value) => setField('department', value)}
                                        >
                                            <SelectTrigger id="department" className="h-11 w-full">
                                                <SelectValue placeholder="Choose a category"/>
                                            </SelectTrigger>
                                            <SelectContent className="max-h-72">
                                                {DEPARTMENTS.map((department) => (
                                                    <SelectItem key={department} value={department}>
                                                        {department}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label htmlFor="price" className="field-label">
                                            Price (₹)<span className="ml-0.5 text-danger">*</span>
                                        </label>
                                        <Input
                                            id="price"
                                            type="number"
                                            min={0}
                                            step={1}
                                            value={formData.price}
                                            onChange={(e) => setField('price', e.target.value)}
                                            placeholder="999"
                                            required
                                        />
                                        <p className="field-hint">Enter 0 to publish it for free.</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* First lesson */}
                        <section className="surface-card p-5 sm:p-6">
                            <h2 className="text-lg font-bold">First lesson</h2>
                            <p className="mt-1 text-sm text-ink-500">
                                Every course needs at least one video to publish.
                            </p>

                            <div className="mt-5 space-y-5">
                                <FileDropzone
                                    label="Lesson video"
                                    accept="video/*"
                                    hint="MP4 or WebM, up to 30 MB"
                                    file={videoFile}
                                    onFile={setVideoFile}
                                    validate={(file) =>
                                        file.size > MAX_VIDEO_SIZE ? 'Video must be 30 MB or smaller.' : null
                                    }
                                    required
                                />

                                <div>
                                    <label htmlFor="videoDescription" className="field-label">
                                        Lesson title<span className="ml-0.5 text-danger">*</span>
                                    </label>
                                    <Input
                                        id="videoDescription"
                                        value={formData.videoDescription}
                                        onChange={(e) => setField('videoDescription', e.target.value)}
                                        placeholder="e.g. 01 - Setting up your environment"
                                        required
                                    />
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Cover + submit */}
                    <aside className="min-w-0 lg:col-span-1">
                        <div className="surface-card sticky top-[calc(var(--nav-h)+1.5rem)] p-5 sm:p-6">
                            <h2 className="text-lg font-bold">Cover image</h2>
                            <p className="mt-1 text-sm text-ink-500">Shown on every course card. 16:9 works best.</p>

                            <FileDropzone
                                label=""
                                accept="image/*"
                                hint="JPG or PNG"
                                file={imageFile}
                                onFile={handleImage}
                                previewUrl={imagePreview}
                                className="mt-4 [&>label]:sr-only"
                                required
                            />

                            <Button type="submit" size="lg" className="mt-6 w-full" disabled={isSubmitting}>
                                {isSubmitting ? 'Publishing...' : 'Publish course'}
                            </Button>

                            <Button asChild type="button" variant="ghost" className="mt-2 w-full">
                                <Link href="/uploadCourse">Cancel</Link>
                            </Button>
                        </div>
                    </aside>
                </form>
            </div>
        </div>
    );
};

export default AddCoursePage;
