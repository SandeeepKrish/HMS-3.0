import React from "react";

const Biography = ({ imageUrl }) => {
  return (
    <>
      <div className="container biography">
        <div className="banner">
          <img src={imageUrl} alt="whoweare" />
        </div>
        <div className="banner">
          <p>Biography</p>
          <h3>Who We Are</h3>
          <p>
            “Our team of doctors brings together years of experience, medical excellence, and genuine compassion. 
            They are dedicated to providing accurate diagnoses, advanced treatments, and personalized care for 
            every patient. At our hospital, your health is in expert hands committed to your well-being.”
          </p>
          <p>We are all in 2025!</p>
          <p>We are working on HMS.</p>

        </div>
      </div>
    </>
  );
};

export default Biography;
