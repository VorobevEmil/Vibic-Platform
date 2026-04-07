import { http } from './httpClient';

export const filesApi = {
  uploadAttachment: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return http.post<string>('/files/attachments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
