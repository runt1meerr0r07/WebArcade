import React from 'react';
import './About.css';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

function About() {
    const openLink = (url) => {
        window.open(url, '_blank');
    };

    return (
        <div className="sky-container">
 
            <div className="moon"></div>
            <div className="night-fog"></div>
            
            <div className="foreground-cloud cloud-1"></div>
            <div className="foreground-cloud cloud-2"></div>
            <div className="foreground-cloud cloud-3"></div>
            <div className="foreground-cloud cloud-4"></div>
            <div className="foreground-cloud cloud-5"></div>
            <div className="foreground-cloud cloud-6"></div>

            <div className="about-content">
                <h1 className="about-title">About</h1>
                
                <div className="floating-buttons">
                    <button 
                        className="floating-button github"
                        onClick={() => openLink('https://github.com/runt1meerr0r07')}
                    >
                        <FaGithub className="button-icon" />
                        <span className="button-text">GitHub</span>
                    </button>
                    <button 
                        className="floating-button linkedin"
                        onClick={() => openLink('https://www.linkedin.com/in/vedant-bothra-4335441b8/')}
                    >
                        <FaLinkedin className="button-icon" />
                        <span className="button-text">LinkedIn</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default About;