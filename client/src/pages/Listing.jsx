import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';

import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore from 'swiper';
import { Navigation} from 'swiper/modules';
import 'swiper/css/bundle';
import { FaBath, FaBed, FaChair, FaMapMarkerAlt, FaParking, FaShare } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import Contact from '../components/Contact';
import { useNavigate } from 'react-router-dom';
import { list } from 'firebase/storage';


export default function Listing() {
  SwiperCore.use([Navigation]);
  const params = useParams();
  const [ listing, setListing ] = useState(null);
  const [ loading, setLoading ] = useState(true);
  const [ error, setError] = useState(false);
  const [ copied, setCopied ] = useState(false);
  const { currentUser }= useSelector((state) => state.user);
  const [ contact, setContact] = useState(false);
  const navigate = useNavigate();
  
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
            if(data.offer === true){
                data.discountPrice = data.regularPrice-data.discountPrice;
            }
            setListing(data);
        } catch(error){
            setError(true);
            setLoading(false);
        }
    }
    fetchListing()
  },[ params.id]);

 
    return( 
        <main className='mb-6'>
            { loading && <p className='text-center my-7 text-2xl'>Loading....</p>}
            { error && <p className='text-center my-7 text-2xl'>something went wrong!</p>}
            { listing && !loading && !error && (
                <>
                    <Swiper navigation>
                        { 
                            listing.imageUrls.map((url) => (
                                <SwiperSlide key={url}>
                                    <div className='h-[550px]' style={{
                                        background: `url(${url}) center no-repeat`,
                                        backgroundSize: 'cover',
                                    }}>
                                    </div>
                                </SwiperSlide>
                            ))
                        }
                    </Swiper>
               
                    <div className='fixed top-[13%] right-[3%] z-10 border rounded-full w-12 h-12 flex justify-center items-center bg-slate-100 cursor-pointer'>
                        <FaShare
                            className='text-slate-500'
                            onClick={()=>{
                                navigator.clipboard.writeText(window.location.href);
                                setCopied(true);
                                setTimeout(()=> {
                                    setCopied(false);
                                }, 2000);
                            }} 
                        />
                    </div>
                    {
                        copied && (
                            <p className='fixed top-[23%] right-[5%] z-10 rounded-md bg-slate-100 p-2'>Link copied!</p>
                        )
                    }
                    <div className='flex flex-col max-w-4xl p-3 mx-auto gap-4'>
                        <p className='text-2xl font-bold'>
                            { listing.name} - ${' '}
                            {
                                listing.offer
                                ? (listing.discountPrice.toLocaleString('en-US')): listing.regularPrice.toLocaleString('en-US')
                            } 
                            {
                                listing.type === 'rent' && ' / month'
                            }
                        </p>
                        <p className='flex items-center mt-6 gap-2 text-slate-600 my-2 text-sm'>
                            <FaMapMarkerAlt className='text-green-700' />
                            { listing.address}
                        </p>
                        <div className='flex gap-4'>
                            <p className='bg-red-900 w-full max-w-[200px] text-white text-center p-1 rounded-md'>
                                {listing.type === 'rent' ? 'For Rent' : 'For sale'}
                            </p>
                            {
                                listing.offer && (
                                <p className='bg-green-900 w-full max-w-[200px] text-white text-center p-1 rounded-md'>
                                    $ {
                                        listing.offer ? listing.discountPrice : listing.regularPrice
                                    }
                                </p>
                                )
                            }
                        </div>
                        <p className='text-slate-800'>
                            <span className='font-semibold text-black'>Description - {' '}</span>
                            {listing.description}
                        </p>
                        <ul className='flex flex-wrap items-center gap-4 sm:gap-6 text-green-900 font-semibold text-sm'>
                            <li className='flex items-center gap-1 whitespace-nowrap'>
                                <FaBed className='text-lg'/>
                                {
                                    listing.bedrooms > 1 ? `${listing.bedrooms} Bedrooms` : `${listing.bedrooms} Bedroom`
                                }
                            </li>
                            <li className='flex items-center gap-1 whitespace-nowrap'>
                                <FaBath className='text-lg'/>
                                {
                                    listing.bathrooms > 1 ? `${listing.bathrooms} Bathrooms` : `${listing.bathrooms} Bathroom`
                                }
                            </li>
                            <li className='flex items-center gap-1 whitespace-nowrap'>
                                <FaParking className='text-lg'/>
                                {
                                    listing.parking ? `Parking spot` : `No Parking`
                                }
                            </li>
                            <li className='flex items-center gap-1 whitespace-nowrap'>
                                <FaChair className='text-lg'/>
                                {
                                    listing.furnished  ? `Furnished` : `Unfurnished`
                                }
                            </li>
                        </ul>
                        {
                            currentUser && listing.userRef !== currentUser._id && !contact && (
                                <button onClick={()=>setContact(true)} className='bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 p-3'>
                                    Contact Landlord
                                </button>
                            )
                        }
                        {
                            contact && <Contact listing={listing} />
                        }
                        {
                            currentUser && listing.userRef === currentUser._id && (
                                <button onClick={()=>{navigate(`/update-listing/${listing._id}`)}} className='bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 p-3'>
                                    Update listing
                                </button>
                            )
                        }
                    </div>
                </>
            )}
        </main>
    );
}
