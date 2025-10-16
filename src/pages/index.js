import dynamic from 'next/dynamic';
import { getHomeSEOAPI } from '@/api/apiService';
// Component
import SEO from '@/components/SEO';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { setHeadSeo_ACTION } from '@/store/headSeoSlice';
const Home = dynamic(() => import('@/components/Home'), { ssr: false });
export async function getStaticProps() {
  try {
    const seoData = await getHomeSEOAPI();
    return {
      props: {
        seoData,
        headLogo: seoData?.image || '/images/logo.png',
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error('Seo Fetch Error:', error);
    return {
      props: { seoData: {}, headLogo: '' },
      revalidate: 60,
    };
  }
}
export default function HomePage({ seoData, headLogo }) {
  const dispatch = useDispatch();
  useEffect(() => {
    if (seoData && Object.keys(seoData).length > 0) {
      dispatch(setHeadSeo_ACTION(seoData));
    }
  }, [seoData, dispatch]); // Dependency array ensures dispatch only on seoData change


  return (
    <>
      <SEO seoData={seoData} />
      <Home headLogo={headLogo} />
    </>
  );
}