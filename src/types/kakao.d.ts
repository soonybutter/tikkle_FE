export {};

type KakaoLink = {
  mobileWebUrl: string;
  webUrl: string;
};

type KakaoShareFeedParams = {
  objectType: 'feed';
  content: {
    title: string;
    description?: string;
    imageUrl?: string;
    link: KakaoLink;
  };
  buttons?: Array<{ title: string; link: KakaoLink }>;
};

interface KakaoSDK {
  init(key: string): void;
  isInitialized?(): boolean;
  Share?: {
    sendDefault(params: KakaoShareFeedParams): void;
  };
}

declare global {
  interface Window {
    Kakao?: KakaoSDK;
  }
}