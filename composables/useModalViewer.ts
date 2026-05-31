import AppModalViewerPdf from '~/components/Modal/AppModalViewerPdf.vue';
import AppModalViewerImage from '~/components/Modal/AppModalViewerImage.vue';
import { useModalStore } from '~/stores/modal';

type ImageViewerSource = {
    name?: string;
    url?: string;
    alt?: string;
};

type PdfViewerSource = {
    name?: string;
    path?: string;
    file?: File;
};

export function useModalViewer() {
    const modalStore = useModalStore();

    function openImageViewer(source: ImageViewerSource) {
        if (!source.url) return;

        modalStore.modalOpen({
            type: 'custom',
            title: source.name || '이미지 미리보기',
            width: '960px',
            component: AppModalViewerImage,
            componentProps: {
                src: source.url,
                alt: source.alt || source.name || '이미지 미리보기',
            },
        });
    }

    function openPdfViewer(source: PdfViewerSource) {
        if (!source.path && !source.file) return;

        modalStore.modalOpen({
            type: 'custom',
            title: source.name || 'PDF 미리보기',
            width: '1100px',
            height: '80vh',
            component: AppModalViewerPdf,
            componentProps: {
                src: source.path,
                file: source.file,
                fileName: source.name,
            },
        });
    }

    return {
        openImageViewer,
        openPdfViewer,
    };
}
