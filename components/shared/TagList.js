import React from 'react';
import Tag from './tag';

const TagList = ({ tags, hrefMode }) => {
    return (
        <div className="flex gap-2">
            {tags.map(({ text, ...rest }) => (
                <Tag {...rest} text={text} hrefMode={hrefMode} key={"taglist-" +text}>
                    <span className="px-4 py-1 text-xs font-semibold uppercase">{text}</span>
                </Tag>
            ))}
        </div>
    );
};

export default TagList;
