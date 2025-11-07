import { useTranslate } from '../hooks/useTranslate';

interface TranslateProps {
  text: string;
  fallback?: string;
}

const Translate = ({ text, fallback }: TranslateProps) => {
  const { translated } = useTranslate(text);

  return <>{typeof translated === 'string' ? translated : (fallback || text)}</>;
};

export default Translate;