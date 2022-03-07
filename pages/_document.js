import Document, {Html, Main, NextScript, Head} from "next/document";

class MyDocument extends Document {
    render() {
        return (
            <Html lang='en'>
            <Head>
                <link rel="preload" href="/fonts/IBMPlexSans-Bold.tff" as="font" crossOrigin="anonymous"/>
                <link rel="preload" href="/fonts/IBMPlexSans-Regular.tff" as="font" crossOrigin="anonymous"/>
                <link rel="preload" href="/fonts/IBMPlexSans-SemiBold.tff" as="font" crossOrigin="anonymous"/>
            </Head>
            <body>
                <Main></Main>
                <NextScript/>
            </body>
        </Html>
        )
    }
}

export default MyDocument;