import { useEffect, useState } from 'react';
import { assets } from '../../assets/assets';
import { url } from '../../App';
import { toast } from 'react-toastify';
import axios from 'axios';

const AddSong = () => {
  const [image, setImage] = useState(false);
  const [song, setSong] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [album, setAlbum] = useState("none");
  const [loading, setLoading] = useState(false);
  const [albumData, setAlbumData] = useState([]);
  const [audioDragActive, setAudioDragActive] = useState(false);
  const [imageDragActive, setImageDragActive] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("desc", desc);
      formData.append("image", image);
      formData.append("audio", song);
      formData.append("album", album);

      const response = await axios.post(`${url}/api/song/add`, formData);

      if (response.data.success) {
        toast.success("Song Added");
        setName("");
        setDesc("");
        setAlbum("none");
        setImage(false);
        setSong(false);
      } else {
        toast.error("Something went wrong");
      }
    } catch (error) {
      toast.error("Error occurred");
    } finally {
      setLoading(false);
    }
  };

  const loadAlbumData = async () => {
    try {
      const response = await axios.get(`${url}/api/album/list`);
      setAlbumData(response.data.albums);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadAlbumData();
  }, []);

  // Drag handlers for audio
  const handleAudioDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setAudioDragActive(true);
    } else if (e.type === "dragleave") {
      setAudioDragActive(false);
    }
  };

  const handleAudioDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAudioDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('audio/')) {
      setSong(file);
    } else {
      toast.error('Please drop an audio file');
    }
  };

  // Drag handlers for image
  const handleImageDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setImageDragActive(true);
    } else if (e.type === "dragleave") {
      setImageDragActive(false);
    }
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setImageDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
    } else {
      toast.error('Please drop an image file');
    }
  };

  return loading ? (
    <div className='grid place-items-center min-h-[80vh]'>
      <div className="w-16 h-16 place-self-center border-4 border-gray-400 border-t-green-800 rounded-full animate-spin"></div>
    </div>
  ) : (
    <form onSubmit={onSubmitHandler} className='flex flex-col items-start gap-8 text-gray-600'>
      <div className='flex gap-8'>
        {/* Audio Upload with Drag & Drop */}
        <div className="flex flex-col gap-4">
          <p>Upload song</p>
          <input
            onChange={(e) => setSong(e.target.files[0])}
            type="file"
            id='song'
            accept='audio/*'
            hidden
          />
          <div
            onDragEnter={handleAudioDrag}
            onDragLeave={handleAudioDrag}
            onDragOver={handleAudioDrag}
            onDrop={handleAudioDrop}
          >
            <label htmlFor="song">
              <img
                className={`w-24 cursor-pointer ${audioDragActive ? 'opacity-50' : ''}`}
                src={song ? assets.upload_added : assets.upload_song}
                alt=""
              />
            </label>
          </div>
        </div>

        {/* Image Upload with Drag & Drop */}
        <div className="flex flex-col gap-4">
          <p>Upload Image</p>
          <input
            onChange={(e) => setImage(e.target.files[0])}
            type="file"
            id='image'
            accept='image/*'
            hidden
          />
          <div
            onDragEnter={handleImageDrag}
            onDragLeave={handleImageDrag}
            onDragOver={handleImageDrag}
            onDrop={handleImageDrop}
          >
            <label htmlFor="image">
              <img
                className={`w-24 cursor-pointer ${imageDragActive ? 'opacity-50' : ''}`}
                src={image ? URL.createObjectURL(image) : assets.upload_area}
                alt=""
              />
            </label>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <p>Song name</p>
        <input
          className='bg-transparent outline-green-600 border-2 border-gray-400 p-2.5 w-[max(40vw,250px)]'
          onChange={(e) => setName(e.target.value)}
          value={name}
          type="text"
          placeholder='Type here'
          required
        />
      </div>

      <div className="flex flex-col gap-2.5">
        <p>Song description</p>
        <input
          className='bg-transparent outline-green-600 border-2 border-gray-400 p-2.5 w-[max(40vw,250px)]'
          onChange={(e) => setDesc(e.target.value)}
          value={desc}
          type="text"
          placeholder='Type here'
          required
        />
      </div>

      <div className="flex flex-col gap-2.5">
        <p>Album</p>
        <select
          className='bg-transparent outline-green-600 border-2 border-gray-400 p-2.5 w-[150px]'
          onChange={(e) => setAlbum(e.target.value)}
          value={album}
        >
          <option value="none">None</option>
          {albumData.map((item, index) => (
            <option key={index} value={item.name}>{item.name}</option>
          ))}
        </select>
      </div>

      <button
        className='text-base bg-black text-white py-2.5 px-14 cursor-pointer'
        type='submit'
      >
        ADD
      </button>
    </form>
  );
};

export default AddSong;
