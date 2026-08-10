'use client';

import React, {useState} from 'react';
import Link from 'next/link';
import {useParams} from 'next/navigation';
import toast from 'react-hot-toast';
import {HiOutlineArrowLeft} from 'react-icons/hi';
import {addVideo} from '@/services/CourseService';
import PageHeader from '@/components/PageHeader';
import FileDropzone from '@/components/FileDropzone';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';

const MAX_VIDEO_SIZE = 30 * 1024 * 1024;

const AddVideoPage: React.FC = () => {
    const {id} = useParams();
    const courseId = Array.isArray(id) ? id[0] : id || '';

    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!videoFile) {
            toast.error('Please select a video to upload.');
            return;
        }

        if (videoFile.size > MAX_VIDEO_SIZE) {
            toast.error('Video must be 30 MB or smaller.');
            return;
        }

        if (!description.trim()) {
            toast.error('Please give the lesson a title.');
            return;
        }

        setIsSubmitting(true);
        const loadingToastId = toast.loading('Uploading your video...');

        try {
            const formData = new FormData();
            formData.append('courseId', courseId);
            formData.append('Video', videoFile);
            formData.append('Video_Description', description);

            const response = await addVideo(formData);

            if (response?.success) {
                toast.success('Lesson added.', {id: loadingToastId});
                setVideoFile(null);
                setDescription('');
            } else {
                toast.dismiss(loadingToastId);
                if (response?.message) toast.error(response.message);
            }
        } catch (error) {
            console.log(error);
            toast.error('Upload failed', {id: loadingToastId});
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <PageHeader
                eyebrow="Teaching"
                title="Add a lesson"
                description="Upload another video to this course. Students see lessons in the order you add them."
                actions={
                    <Button asChild variant="outline">
                        <Link href={`/view/course/${courseId}`}>
                            <HiOutlineArrowLeft className="h-4 w-4"/>
                            Back to course
                        </Link>
                    </Button>
                }
            />

            <div className="container-page page-shell">
                <form onSubmit={handleSubmit} className="mx-auto max-w-2xl">
                    <div className="surface-card space-y-5 p-5 sm:p-6">
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
                            <label htmlFor="lesson-title" className="field-label">
                                Lesson title<span className="ml-0.5 text-danger">*</span>
                            </label>
                            <Input
                                id="lesson-title"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="e.g. 04 - Handling form state"
                                required
                            />
                            <p className="field-hint">
                                Numbering your lessons keeps the list readable for students.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 border-t border-ink-200 pt-5 sm:flex-row sm:justify-end">
                            <Button asChild type="button" variant="outline">
                                <Link href={`/view/course/${courseId}`}>Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Uploading...' : 'Upload lesson'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddVideoPage;
