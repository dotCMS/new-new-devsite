import BlogComponent from "../blogs/blog-component";
import APIPlaygrounds from "./api-playgrounds";
import Heading from "./heading";
import Hero from "./hero";
import LinkCards from "./link-cards";
import RelatedBlogs from "./related-blogs";
import WebPageContent from "./webPageContent";
import DevResourceComponent from "../learning/devresource-component";
import DocumentationComponent from "../documentation/DocumentationComponent";

export const pageComponents = {
    webPageContent: WebPageContent,
    DocumentationHero: Hero,
    Heading: Heading,
    DocumentationLinks: LinkCards,
    DocumentationApiPlaygrounds: APIPlaygrounds,
    RelatedBlogs: RelatedBlogs,
    DevResource: DevResourceComponent,
    Blog: BlogComponent,
    DotcmsDocumentation: DocumentationComponent
};
