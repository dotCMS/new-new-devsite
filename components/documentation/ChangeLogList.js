
import OnThisPage from '../navigation/OnThisPage'
import ChangeLogEntry from './ChangeLogEntry'
export default async function ChangeLogContainer({ changelogData }) {

    //console.log("data", await changelogData)
    const { changelogs, pagination } = await changelogData

    console.log("pagination", pagination)
    if (!changelogs || changelogs.length === 0) return <div>No data</div>



    return (
        <div className="max-w-[1400px] mx-auto flex">
            <main
                className="flex-1 px-12
            [&::-webkit-scrollbar]:w-1.5
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:bg-muted-foreground/10
            [&::-webkit-scrollbar-thumb]:rounded-full
            hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/20"
            >
                <h1 className="text-4xl font-bold mb-6">Changelogs</h1>
                {changelogs.map((item, index) => (
                    <ChangeLogEntry key={index} item={item} />
                ))}
            </main>
            <div className="w-64 shrink-0 hidden xl:block">
                <div className="sticky top-16 pt-8 pl-8">
                    <OnThisPage selectors={"main h2"} />
                </div>
            </div>
        </div>
    )
}
