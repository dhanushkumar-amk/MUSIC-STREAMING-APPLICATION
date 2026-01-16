import React, { useState } from 'react';
import { assets } from '../../assets/assets';
import { NavLink } from 'react-router-dom';
import { X, Menu } from 'lucide-react';

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => setIsOpen(!isOpen);
    const closeSidebar = () => setIsOpen(false);

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={toggleSidebar}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#003A10] text-white rounded-lg shadow-lg"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed lg:static inset-y-0 left-0 z-40
                bg-[#003A10] min-h-screen pl-[4vw] pr-4
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                w-64 lg:w-auto
            `}>
                <img
                    src={assets.logo}
                    alt="Logo"
                    className="mt-5 w-32 lg:w-[max(10vw,100px)] hidden sm:block"
                />
                <img
                    src={assets.logo_small}
                    alt="Logo"
                    className="mt-5 w-12 sm:hidden block"
                />

                <div className="flex flex-col gap-3 mt-10 pb-8">
                    <NavLink
                        to='/add-song'
                        onClick={closeSidebar}
                        className="flex items-center gap-2.5 text-gray-800 bg-white border border-black p-3 rounded-lg drop-shadow-[-4px_4px_#00FF5B] text-sm font-medium hover:scale-105 transition-transform active:scale-95"
                    >
                        <img className='w-5' src={assets.add_song} alt="" />
                        <p>Add Song</p>
                    </NavLink>

                    <NavLink
                        to='/list-songs'
                        onClick={closeSidebar}
                        className="flex items-center gap-2.5 text-gray-800 bg-white border border-black p-3 rounded-lg drop-shadow-[-4px_4px_#00FF5B] text-sm font-medium hover:scale-105 transition-transform active:scale-95"
                    >
                        <img className='w-5' src={assets.song_icon} alt="" />
                        <p>List Songs</p>
                    </NavLink>

                    <NavLink
                        to='/add-album'
                        onClick={closeSidebar}
                        className="flex items-center gap-2.5 text-gray-800 bg-white border border-black p-3 rounded-lg drop-shadow-[-4px_4px_#00FF5B] text-sm font-medium hover:scale-105 transition-transform active:scale-95"
                    >
                        <img className='w-5' src={assets.add_album} alt="" />
                        <p>Add Album</p>
                    </NavLink>

                    <NavLink
                        to='/list-albums'
                        onClick={closeSidebar}
                        className="flex items-center gap-2.5 text-gray-800 bg-white border border-black p-3 rounded-lg drop-shadow-[-4px_4px_#00FF5B] text-sm font-medium hover:scale-105 transition-transform active:scale-95"
                    >
                        <img className='w-5' src={assets.album_icon} alt="" />
                        <p>List Albums</p>
                    </NavLink>

                    <NavLink
                        to='/add-artist'
                        onClick={closeSidebar}
                        className="flex items-center gap-2.5 text-gray-800 bg-white border border-black p-3 rounded-lg drop-shadow-[-4px_4px_#00FF5B] text-sm font-medium hover:scale-105 transition-transform active:scale-95"
                    >
                        <svg className='w-5' fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                        </svg>
                        <p>Add Artist</p>
                    </NavLink>

                    <NavLink
                        to='/list-artist'
                        onClick={closeSidebar}
                        className="flex items-center gap-2.5 text-gray-800 bg-white border border-black p-3 rounded-lg drop-shadow-[-4px_4px_#00FF5B] text-sm font-medium hover:scale-105 transition-transform active:scale-95"
                    >
                        <svg className='w-5' fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        <p>List Artists</p>
                    </NavLink>

                    <NavLink
                        to='/users'
                        onClick={closeSidebar}
                        className="flex items-center gap-2.5 text-gray-800 bg-white border border-black p-3 rounded-lg drop-shadow-[-4px_4px_#00FF5B] text-sm font-medium hover:scale-105 transition-transform active:scale-95"
                    >
                        <svg className='w-5' fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        <p>Users</p>
                    </NavLink>

                    <NavLink
                        to='/stats'
                        onClick={closeSidebar}
                        className="flex items-center gap-2.5 text-gray-800 bg-white border border-black p-3 rounded-lg drop-shadow-[-4px_4px_#00FF5B] text-sm font-medium hover:scale-105 transition-transform active:scale-95"
                    >
                        <svg className='w-5' fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                        </svg>
                        <p>Statistics</p>
                    </NavLink>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
