import { Html,Head, Font, Preview, Heading, Row, Section, Text, Button } from '@react-email/components';

interface VerificationEmailProps {
    username: string;
    otp: string;
}

export default function VerificationEmail({username, otp}: VerificationEmailProps) {
    return (
        <Html lang="en" dir="ltr">
            <Head >
                <title>Verification Code</title>
                {/* <Font
                    fontFamily="Inter"
                    fallbackFontFamily="Arial"
                    src="https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa2JL7SUc.woff2"
                /> */}

            </Head> 
            <Preview>Here &apos;is your verification code : {otp}</Preview>
            <Section>
                <Row>
                    <Heading as="h2">Hello {username}</Heading>
                </Row>
                <Row>
                    <Text>
                        Thank You for registering. Please use the code below to verify your account.
                    </Text>
                </Row>
                <Row>
                    <Text>
                        {otp}
                    </Text>
                </Row>
            </Section>
        </Html>   
    )
}