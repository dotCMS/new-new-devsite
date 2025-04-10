import BlogComponent from "./blogs/blog-component";
import APIPlaygrounds from "./content-types/api-playgrounds";
import Heading from "./content-types/heading";
import Hero from "./content-types/hero";
import LinkCards from "./content-types/link-cards";
import RelatedBlogs from "./content-types/related-blogs";
import WebPageContent from "./content-types/webPageContent";
import DevResourceComponent from "./learning/devresource-component";
import DocumentationComponent from "./documentation/DocumentationComponent";

export const UVEComponentsMap = {
    webPageContent: WebPageContent,
    DocumentationHero: Hero,
    Heading: Heading,
    DocumentationLinks: LinkCards,
    DocumentationApiPlaygrounds: APIPlaygrounds,
    RelatedBlogs: RelatedBlogs,
    DevResource: DevResourceComponent,
    Blog:BlogComponent,
    DotcmsDocumentation: DocumentationComponent
};