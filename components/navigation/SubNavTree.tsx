import Link from 'next/link';
import { cn } from "@/util/utils";

type SubNavTreeProps = {
  items: any[];
  currentPath: string;
  level: number;
}

const SubNavTree = ({ items, currentPath, level }: SubNavTreeProps) => {
    if (!items) return null;
    
    return (
        <ul className="ml-4">
            {items.map((item) => (
                <li key={item.title} className="mt-1">
                    <Link
                        href={`/docs/latest/${item.urlTitle}`}
                        className={cn(
                            "block py-1 px-2 rounded-md hover:bg-accent",
                            currentPath === item.urlTitle ? "bg-accent" : ""
                        )}
                    >
                        {item.title}
                    </Link>
                    {item.dotcmsdocumentationchildren && (
                        <SubNavTree
                            items={item.dotcmsdocumentationchildren}
                            currentPath={currentPath}
                            level={level + 1}
                        />
                    )}
                </li>
            ))}
        </ul>
    );
};

export default SubNavTree; 