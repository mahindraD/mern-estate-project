import { useSelector } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from '../firebase';
import { deleteUserFailure, deleteUserStart, deleteUserSuccess, signOutUserFailure, signOutUserStart, signOutUserSuccess, updateUserFailure, updateUserStart, updateUserSuccess } from '../redux/user/userSlice';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const fileRef = useRef(null);
  const [ file, setFile ] = useState(undefined);
  const [ filePerc, setFilePerc ] = useState(0);  
  const [ fileUploadError, setFileUploadError ] = useState(false);
  const [ formData, setFormData ] = useState({});
  const dispatch = useDispatch();
  const [ updateSuccess, setUpdateSuccess ] = useState(false);
  const [ showListingsError,setShowListingsError]= useState(false);
  const [ userListings, setUserListings ] = useState([]);

  useEffect(() => {
    if(file){
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    uploadTask.on('state_changed',
      ( snapshot ) => {
        console.log(snapshot);
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
      },
      (error)=>{
        setFileUploadError(true);
      },
      ()=>{
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFormData({ ...formData, avatar: downloadURL});
        })
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value});
  };

  const handleSubmit = async (e) =>{
    e.preventDefault();
    try{
      dispatch(updateUserStart);
      const res = await fetch(`/api/user/update/${currentUser._id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type' : 'application/json',
          },
          body: JSON.stringify(formData),
        });
      const data = await res.json();
      if(data.success === false){
        dispatch(updateUserFailure(data.message));
        return;
      }
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch(error){
      dispatch(updateUserFailure(error.message));
    }
  }

  const handleDeleteUser = async () =>{
    try{
      dispatch(deleteUserStart);
      const res = await fetch(`/api/user/delete/${currentUser._id}`,
        {
          method:'DELETE',
        });
      const data = res.json();
      if(data.success === false){
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch(error){
      dispatch(deleteUserFailure(error.message));
    }
     
  }

  const handleSignOut = async() =>{
    try{
      dispatch(signOutUserStart);
      const res = await fetch(`/api/auth/signout`);
      const data = res.json();
      if(data.success === false){
        dispatch(signOutUserFailure(data.message));
        return;
      }
      dispatch(signOutUserSuccess(data));
    } catch(error){
      dispatch(signOutUserFailure(error.message));
    }
  }

  const handleShowListing = async() =>{
      try{
        setShowListingsError(false);
        const res = await fetch(`/api/user/listings/${currentUser._id}`);
        const data = await res.json();
        if(data.success === false){
          setShowListingsError(true);
          return;
        }
        setUserListings(data);
      } catch(e){
          showListingsError(true);
      }
  }

  const handleListingDelete = async(listingId) =>{
    try{
      const res = await fetch(`/api/listing/delete/${listingId}`,{
        method:'DELETE',
      });
      const data = await res.json();
      if(data.success === false){
        console.log(data);
        return;
      }
      setUserListings((prev) => prev.filter((listing) => listing._id !== listingId));
    } catch(error){
      console.log(error);
    }
  }


  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7 '>Profile</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input onChange={(e)=>setFile(e.target.files[0])} type='file' ref={fileRef} hidden accept='image/*'/>
        <img onClick={()=>fileRef.current.click()} src={ formData.avatar || currentUser.avatar } alt="profile" className='rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2'/>
        <p className='text-sm self-center'>
          {
            fileUploadError ? (
              <span className='text-red-700'>Error Image Upload(image must be less than 2 mb)</span>
            ) : (
              filePerc > 0 && filePerc < 100 ? (
                <span className='text-slate-700'> {`uploading ${filePerc}%`}</span>
              ) : (
                filePerc === 100 ? (
                  <span className='text-green-700'>Image successfully uploaded</span>
                ) : ("")
              )
            )
          }
        </p>
        <input type="text" placeholder='username' className='border p-3 rounded-lg' id="username" defaultValue={currentUser.username} onChange={handleChange}/>
        <input type="email" placeholder='email' className='border p-3 rounded-lg' id="email" defaultValue={currentUser.email}onChange={handleChange}/>
        <input type="password" placeholder='password' className='border p-3 rounded-lg' id="password" onChange={handleChange}/>
        <button className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-90 disabled:opacity-75' disabled={loading}>{loading ? "loading..." : "update"}</button>
        <Link to={"/create-listing"} className='bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-90'>
          Create Listing
        </Link>
      </form>
      <div className='flex justify-between mt-5'>
        <span className='text-red-700 cursor-pointer' onClick={handleDeleteUser}>Delete Account</span>
        <span className='text-red-700 cursor-pointer' onClick={handleSignOut}>Sign out</span>
      </div>
      <p className='text-red-700 mt-5'>
        { error ? error.message : ""}
      </p>
      <p className='text-green-700 mt-5'>
        { updateSuccess ? "user update successfully" : ""}
      </p>
      <button className='text-green-700 w-full  ' onClick={handleShowListing}>
        Show Listing
      </button>
      <p className='text-red-700'>{ showListingsError ? "Error showing listing(please login once again)" : ""}</p>
      {
        userListings && userListings.length>0 &&
        <div className='flex flex-col gap-4'>
          <h1 className='text-center mt-7 text-2xl font-semibold'>Your Listings</h1>
          {userListings.map((listing) => (
            <div key={listing._id} className='border rounded-lg p-3 flex justify-between items-center gap-4'>
              <Link to={`/listing/${listing._id}`}>
                <img src={listing.imageUrls[0]} alt="listing cover" className='h-16 w-18 object-contain rounded-lg' />
              </Link>
              <Link className='text-slate-700 font-semibold flex-1 hover:underline truncate' to={`/listing/${listing._id}`}>
                 <p >{listing.name}</p>
              </Link>
              <div className='flex flex-col items-center'>
                <button className='uppercase text-red-700 ' onClick={()=>handleListingDelete(listing._id)}>delete</button>
                <Link to={`/update-listing/${listing._id}`}>
                  <button className='uppercase text-green-700 '>edit</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      }
    </div>
  )
}
