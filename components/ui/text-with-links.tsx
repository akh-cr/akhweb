import React from 'react';

interface TextWithLinksProps {
    text: string;
    className?: string;
}

export function TextWithLinks({ text, className }: TextWithLinksProps) {
    if (!text) return null;

    // Clean common HTML entities
    const cleanText = text.replace(/&nbsp;/g, ' ');

    // Regex to find URLs: http://, https://, or www.
    // We use a capturing group to include the URL in the split result.
    // Matches until whitespace.
    const urlRegex = /((?:https?:\/\/|www\.)[^\s]+)/g;

    const parts = cleanText.split(urlRegex);

    return (
        <p className={className}>
            {parts.map((part, index) => {
                // Check if this part matches our URL pattern
                if (part.match(urlRegex)) {
                    let href = part;
                    // Add https:// if it starts with www.
                    if (part.startsWith('www.')) {
                        href = `https://${part}`;
                    }
                    
                    // Simple logic to remove trailing punctuation if it was captured
                    // (e.g. "google.com." -> "google.com")
                    const trailingPunctuation = /[.,;!?)]$/;
                    let suffix = "";
                    if (trailingPunctuation.test(href)) {
                        suffix = href.slice(-1);
                        href = href.slice(0, -1);
                        part = part.slice(0, -1); // Update display text too? 
                        // Actually, split(regex) includes the exact match. 
                        // If "google.com." matched [^\s]+, then it is in 'part'.
                        // We should separate the punctuation from the link.
                    }

                    // A better approach for punctuation:
                    // If the regex matches "url.", we want to render <a>url</a>.
                    // But our regex `[^\s]+` matches "url.".
                    // Let's refine the split logic or just strip it here.
                    // If we strip it here, we need to append the suffix after the <a>.
                    
                    if (/[.,;!?)]$/.test(part)) {
                         const cleanPart = part.slice(0, -1);
                         const cleanHref = href.slice(0, -1);
                         const punct = part.slice(-1);
                         return (
                            <React.Fragment key={index}>
                                <a 
                                    href={cleanHref} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-primary underline hover:text-primary/80 transition-colors"
                                >
                                    {cleanPart}
                                </a>
                                {punct}
                            </React.Fragment>
                         );
                    }

                    return (
                        <a 
                            key={index} 
                            href={href} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary underline hover:text-primary/80 transition-colors"
                        >
                            {part}
                        </a>
                    );
                }
                
                return <React.Fragment key={index}>{part}</React.Fragment>;
            })}
        </p>
    );
}
