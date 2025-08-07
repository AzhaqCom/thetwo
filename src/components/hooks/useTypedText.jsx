import { useState, useEffect, useRef } from 'react';

const useTypedText = (fullText, typingSpeed = 20) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(true);
    const indexRef = useRef(0);
    const intervalRef = useRef(null);

    useEffect(() => {
        setDisplayedText('');
        indexRef.current = 0;
        setIsTyping(true);

        intervalRef.current = setInterval(() => {
            setDisplayedText(prev => {
                if (indexRef.current >= fullText.length) {
                    clearInterval(intervalRef.current);
                    setIsTyping(false);
                    return prev;
                }
                const nextChar = fullText.charAt(indexRef.current);
                indexRef.current += 1;
                return prev + nextChar;
            });
        }, typingSpeed);

        return () => clearInterval(intervalRef.current);
    }, [fullText, typingSpeed]);

    const skipTyping = () => {
        clearInterval(intervalRef.current);
        setDisplayedText(fullText);
        setIsTyping(false);
    };

    return { displayedText, isTyping, skipTyping };
};

export default useTypedText;
