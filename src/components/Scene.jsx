import React from 'react';
import useTypedText from './hooks/useTypedText';

const Scene = ({ text, choices, onChoice }) => {
    const { displayedText, isTyping, skipTyping } = useTypedText(text);

    const handleTextClick = () => {
        if (isTyping) {
            skipTyping();
        }
    };
 
    return (
        <div className="scene">
            <div className="scene-text" onClick={handleTextClick}>
                {displayedText}
            </div>
            <div className="scene-choices">
                {choices && choices.map((choice, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            if (choice.next) {
                                console.log(choice.next)
                                onChoice(choice.next);
                            } else if (choice.action) {
                                onChoice(choice.action);
                            }
                        }}
                    >
                        {choice.text}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Scene;
