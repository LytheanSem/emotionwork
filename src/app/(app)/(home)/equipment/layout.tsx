import configPromise from "@payload-config";
import { getPayload } from "payload";
import { SearchFilter } from "../search-filters";

interface Props {
  children: React.ReactNode;
}

const Layout = async ({ children }: Props) => {
  const payload = await getPayload({
    config: configPromise,
  });

  const data = await payload.find({
    collection: "categories",
    pagination: false,
  });

  // formatting the data after fetching so that you can do data.map since if you don't, you have to do data.docs.map
  const formattedData = data.docs.map((doc) => ({
    ...doc,
  }));
  return (
    <div className="flex flex-col min-h-screen">
      <SearchFilter data={formattedData} />
      <main className="flex-1 bg-[#F4F4F0]">{children}</main>
    </div>
  );
};
export default Layout;
