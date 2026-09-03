export default function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "Institute of Digital Studies",
    alternateName: "IDS Noida",
    url: "https://idigitalstudies.com",
    logo: "https://scholarship.idigitalstudies.com/IDS_LOGO.svg",
    description:
      "Premier digital marketing institute providing industry-aligned master programs, practical agency internships, and merit scholarships in Noida & Delhi NCR.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Sector 62",
      addressLocality: "Noida",
      addressRegion: "Uttar Pradesh",
      postalCode: "201309",
      addressCountry: "IN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-9876543210",
      contactType: "admissions",
      areaServed: "IN",
      availableLanguage: ["English", "Hindi"],
    },
    sameAs: [
      "https://www.facebook.com/idigitalstudies",
      "https://www.instagram.com/idigitalstudies",
      "https://www.linkedin.com/company/idigitalstudies",
    ],
  };

  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "Digital Marketing Master Program & Scholarship Assessment (DMST)",
    description:
      "Online standardized scholarship aptitude assessment for admission into advanced digital marketing master programs with up to 70% merit grant.",
    provider: {
      "@type": "EducationalOrganization",
      name: "Institute of Digital Studies",
      sameAs: "https://idigitalstudies.com",
    },
    educationalCredentialAwarded: "Digital Marketing Merit Scholarship Certificate",
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "Online & Classroom",
      courseWorkload: "5 Minutes Assessment",
    },
    offers: {
      "@type": "Offer",
      category: "Scholarship Grant",
      price: "0",
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      validFrom: "2026-01-01",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is the Digital Marketing Scholarship Test (DMST)?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The DMST is a standardized 5-minute online assessment organized by the Institute of Digital Studies (IDS) to evaluate foundational knowledge in SEO, PPC, Social Media, and Web Analytics for granting merit scholarships up to 70%.",
        },
      },
      {
        "@type": "Question",
        name: "How much scholarship can I qualify for through this test?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Candidates can qualify for Up to 70% Merit Scholarship. The exact scholarship grant is evaluated dynamically by the Academic Committee based on your test performance, accuracy, speed, and candidate profile.",
        },
      },
      {
        "@type": "Question",
        name: "Is there any negative marking in the assessment?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No, there is zero negative marking. Candidates are encouraged to attempt all 20 multiple-choice questions within the 5-minute time limit.",
        },
      },
      {
        "@type": "Question",
        name: "How will I receive my test scorecard and scholarship grant letter?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Your scorecard is displayed immediately upon test submission, and a Senior Academic Counselor from IDS will contact you on your verified WhatsApp number within 24 hours with your official grant letter.",
        },
      },
      {
        "@type": "Question",
        name: "Who is eligible to take the DMST scholarship assessment?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "College students, recent graduates, working professionals looking for a career transition, and business owners looking to learn digital marketing are all eligible to participate.",
        },
      },
      {
        "@type": "Question",
        name: "What anti-cheat proctoring rules apply during the test?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The test features AI-monitored tab-switch detection on desktop and app-switch monitoring on mobile. Candidates receive up to 2 warnings, and on the 3rd violation strike, the test auto-submits immediately.",
        },
      },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Institute of Digital Studies",
        item: "https://idigitalstudies.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Scholarship Portal",
        item: "https://scholarship.idigitalstudies.com",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "DMST Assessment 2026",
        item: "https://scholarship.idigitalstudies.com#assessment",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
