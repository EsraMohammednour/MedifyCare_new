import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Consult() {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/');
        setDoctors(response.data.doctors);
        setSpecialties(['All', ...response.data.specialties]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSpecialty =
      selectedSpecialty === 'All' || doctor.specialty.toLowerCase() === selectedSpecialty.toLowerCase();
    const matchesSearch = doctor.username.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSpecialty && matchesSearch;
  });

  const handleCardClick = (doctorUsername) => {
    navigate(`/chat/${doctorUsername}`);
  };

  return (
    <section className="bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="py-12 md:py-20">
          <div className="max-w-3xl mx-auto text-center pb-12 md:pb-20">
            <h2 className="h2 font-playfair-display text-slate-800">
              Get expert medical advice from our team of specialists
            </h2>
          </div>

          <div className="flex gap-4 justify-center mb-8">
            <select
              className="border rounded px-4 py-2"
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}>
              {specialties.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Search by name"
              className="border rounded px-4 py-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div
            className="max-w-sm mx-auto sm:max-w-none grid gap-12 sm:grid-cols-2 md:grid-cols-3 sm:gap-x-6 sm:gap-y-8 items-start mb-12 md:mb-16"
            data-aos-id-testimonials>
            {filteredDoctors.map((doctor, index) => (
              <article
                key={index}
                className="h-full flex flex-col bg-white p-6 shadow-xl cursor-pointer"
                data-aos="fade-up"
                data-aos-anchor="[data-aos-id-testimonials]"
                onClick={() => handleCardClick(doctor.username)}>
                <header>
                  <div className="flex items-center mb-4">
                    <div className="relative mr-5">
                      <img
                        className="rounded-full shrink-0"
                        src={doctor.image_filename || '../assets/images/img.jpg'}
                        width={48}
                        height={48}
                        alt={doctor.username}
                      />
                    </div>
                    <p>{doctor.username}</p>
                  </div>
                </header>
                <div className="grow mb-3">
                  <p className="text-slate-500 italic">{doctor.bio}</p>
                </div>
                <footer className="text-sm font-medium">
                  <span className="text-slate-800">{doctor.username}</span>
                  <span className="text-slate-300"> · </span>
                  <span className="text-slate-500 capitalize">{doctor.specialty}</span>
                </footer>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
