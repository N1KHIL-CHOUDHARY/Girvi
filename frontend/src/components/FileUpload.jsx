import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { uploadFile } from '../services/api';

export default function FileUpload({ value, onChange, label }) {
	const { t } = useTranslation();
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
			setError(err.response?.data?.message || t('errors.uploadFailed'));
		} finally {
			setIsUploading(false);
		}
	};

	const labelText = label ?? t('common.uploadPhoto');

	return (
		<div className="space-y-2">
			<label className="text-sm text-neutral-700">{labelText}</label>
			<div className="flex items-center gap-3">
				<input
					type="file"
					accept="image/*"
					onChange={handleFile}
					disabled={isUploading}
					className="text-sm"
				/>
				{isUploading && <span className="text-sm text-neutral-500">{t('common.uploading')}</span>}
			</div>
			{value && (
				<div className="mt-2">
					<img src={value} alt={t('common.preview')} className="h-16 w-16 rounded-md object-cover" />
				</div>
			)}
			{error && <p className="text-sm text-red-500">{error}</p>}
		</div>
	);
}


