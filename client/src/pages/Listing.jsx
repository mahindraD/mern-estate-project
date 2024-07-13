import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore from 'swiper';
import { Navigation} from 'swiper/modules';
import 'swiper/css/bundle';

export default function Listing() {
    SwiperCore.use([Navigation]);
  const params = useParams();
  const [ listing, setListing ] = useState(null);
  const [ loading, setLoading ] = useState(true);
  const [ error, setError] = useState(false);
  
  useEffect(() => {
    const fetchListing = async () =>{
        try{
            setLoading(true);
            const res = await fetch(`/api/listing/get/${params.id}`);
            const data =await res.json();
            if(data.success === false){
                setError(true);
                setLoading(false);
            }
            setLoading(false);
            setListing(data);
        } catch(error){
            setError(true);
            setLoading(false);
        }
    }
    fetchListing()
  },[ params.id]);

    return( 
        <main>
            { loading && <p className='text-center my-7 text-2xl'>Loading....</p>}
            { error && <p className='text-center my-7 text-2xl'>something went wrong!</p>}
            { (listing && !loading && !error && 
                <div>
                    <Swiper navigation>
                        { 
                            listing.imageUrls.map((url) => (
                                <SwiperSlide key={url}>
                                    <div className='h-[550px]' style={{
                                        background: `url(${url}) center 
                                        no-repeat`,
                                        backgrondSize : 'cover',
                                    }}>
                                    </div>
                                </SwiperSlide>
                            ))
                        }
                    </Swiper>
                </div>
            )}
        </main>
    );
}
