import React, { useState } from 'react';
import { uploadFile } from '../services/api';

export default function FileUpload({ value, onChange, label = 'Upload Photo' }) {
	const [isUploading, setIsUploading] = useState(false);
	const [error, setError] = useState('');

	const handleFile = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setError('');
		try {
			setIsUploading(true);
			const res = await uploadFile(file);
			onChange(res.data.url);
		} catch (err) {
			setError(err.response?.data?.message || 'Upload failed');
		} finally {
			setIsUploading(false);
		}
	};

	return (
		<div className="space-y-2">
			<label className="text-sm text-neutral-700">{label}</label>
			<div className="flex items-center gap-3">
				<input
					type="file"
					accept="image/*"
					onChange={handleFile}
					disabled={isUploading}
					className="text-sm"
				/>
				{isUploading && <span className="text-sm text-neutral-500">Uploading...</span>}
			</div>
			{value && (
				<div className="mt-2">
					<img src={value} alt="Preview" className="h-16 w-16 rounded-md object-cover" />
				</div>
			)}
			{error && <p className="text-sm text-red-500">{error}</p>}
		</div>
	);
}


