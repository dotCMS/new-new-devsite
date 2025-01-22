import ContentletCard from '../../contentletCard';

export const RelatedPosts = ({ posts }) => {
    return (
        <div className="p-4 pt-11 md:p-16 lg:px-32">
            <div className="container p-0">
                <div className="mb-12 flex flex-col gap-8 lg:mb-24">
                    <h4>Recommended Reading</h4>
                    <ul
                        className={`grid sm:grid-cols-[repeat(auto-fit,minmax(17.5rem,1fr))] gap-6`}>
                        {posts.map((contentlet, i) => (
                            <li className="cursor-pointer" key={contentlet.title + i}>
                                <ContentletCard contentlet={contentlet} />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};
