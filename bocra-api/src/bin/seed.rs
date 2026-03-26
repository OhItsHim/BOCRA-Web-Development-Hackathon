use argon2::{password_hash::SaltString, Argon2, PasswordHasher};
use chrono::NaiveDate;
use sqlx::postgres::PgPoolOptions;
use uuid::Uuid;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();
    let database_url = std::env::var("DATABASE_URL")?;
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await?;

    println!("Running migrations...");
    sqlx::migrate!("./migrations").run(&pool).await?;

    println!("Seeding users...");
    let salt = SaltString::generate(&mut rand::rngs::OsRng);
    let argon2 = Argon2::new(
        argon2::Algorithm::Argon2id,
        argon2::Version::V0x13,
        argon2::Params::new(65536, 3, 4, None).unwrap(),
    );

    let admin_hash = argon2.hash_password(b"Admin123!", &salt).unwrap().to_string();
    let staff_hash = argon2.hash_password(b"Staff123!", &salt).unwrap().to_string();
    let public_hash = argon2.hash_password(b"Public123!", &salt).unwrap().to_string();

    // Admin user
    let admin_id = sqlx::query_scalar!(
        r#"INSERT INTO users (email, password_hash, role, first_name, last_name, organization, is_verified)
           VALUES ($1, $2, 'ADMIN', $3, $4, $5, true)
           ON CONFLICT (email) DO UPDATE SET password_hash = $2
           RETURNING id"#,
        "admin@bocra.org.bw",
        admin_hash,
        "Keabetswe",
        "Moatlhodi",
        "BOCRA"
    )
    .fetch_one(&pool)
    .await?;
    println!("Created admin: admin@bocra.org.bw / Admin123!");

    // Staff user
    sqlx::query!(
        r#"INSERT INTO users (email, password_hash, role, first_name, last_name, organization, is_verified)
           VALUES ($1, $2, 'STAFF', $3, $4, $5, true)
           ON CONFLICT (email) DO UPDATE SET password_hash = $2"#,
        "staff@bocra.org.bw",
        staff_hash,
        "Thato",
        "Seretse",
        "BOCRA"
    )
    .execute(&pool)
    .await?;
    println!("Created staff: staff@bocra.org.bw / Staff123!");

    // Public users
    let public_users = vec![
        ("kagiso.sithole@gmail.com", "Kagiso", "Sithole"),
        ("neo.molefe@gmail.com", "Neo", "Molefe"),
        ("boitumelo.dlamini@gmail.com", "Boitumelo", "Dlamini"),
        ("tebogo.kgosi@gmail.com", "Tebogo", "Kgosi"),
        ("lesedi.mabaso@gmail.com", "Lesedi", "Mabaso"),
    ];

    for (email, first, last) in &public_users {
        sqlx::query!(
            r#"INSERT INTO users (email, password_hash, role, first_name, last_name, is_verified)
               VALUES ($1, $2, 'PUBLIC', $3, $4, true)
               ON CONFLICT (email) DO NOTHING"#,
            email, public_hash, first, last
        )
        .execute(&pool)
        .await?;
    }
    println!("Created {} public users", public_users.len());

    println!("Seeding licensees...");
    let licensees_data = vec![
        ("Botswana Telecommunications Corporation", "LIC-TELE-0001", "TELECOM_CLASS", "TELECOM", "ACTIVE", Some("btc@btc.bw"), Some("https://www.btc.bw"), "Botswana's national telecommunications company providing fixed-line and broadband services."),
        ("Mascom Wireless Botswana", "LIC-TELE-0002", "TELECOM_INDIVIDUAL", "TELECOM", "ACTIVE", Some("info@mascom.bw"), Some("https://www.mascom.bw"), "Largest mobile network operator in Botswana."),
        ("Orange Botswana", "LIC-TELE-0003", "TELECOM_INDIVIDUAL", "TELECOM", "ACTIVE", Some("info@orange.co.bw"), Some("https://www.orange.co.bw"), "Mobile operator providing voice, data, and digital services."),
        ("BeMobile", "LIC-TELE-0004", "TELECOM_INDIVIDUAL", "TELECOM", "ACTIVE", Some("info@bemobile.bw"), Some("https://www.bemobile.bw"), "Mobile telecommunications network operator."),
        ("Botswana Post", "LIC-POST-0001", "POSTAL_COURIER", "POSTAL", "ACTIVE", Some("info@botswanapost.co.bw"), Some("https://www.botswanapost.co.bw"), "National postal service provider of Botswana."),
        ("Dithuthu FM", "LIC-BCAST-0001", "BROADCAST_COMMUNITY_RADIO", "BROADCASTING", "ACTIVE", Some("dithuthu@radio.bw"), None, "Community radio station serving the Gaborone area."),
        ("Gabz FM", "LIC-BCAST-0002", "BROADCAST_COMMERCIAL_RADIO", "BROADCASTING", "ACTIVE", Some("info@gabzfm.bw"), Some("https://www.gabzfm.bw"), "Commercial radio station based in Gaborone."),
        ("Botswana Television (BTV)", "LIC-BCAST-0003", "BROADCAST_FTA_TV", "BROADCASTING", "ACTIVE", Some("info@btv.bw"), Some("https://www.btv.bw"), "National public broadcaster of Botswana."),
        ("eMedia Botswana", "LIC-BCAST-0004", "BROADCAST_PAY_TV", "BROADCASTING", "ACTIVE", Some("info@emedia.bw"), None, "Pay television content provider."),
        ("Kgotla Networks", "LIC-INET-0001", "INTERNET_ISP", "INTERNET", "ACTIVE", Some("info@kgotla.bw"), None, "Internet service provider for residential and business clients."),
        ("SwiftCourier BW", "LIC-POST-0002", "POSTAL_EXPRESS", "POSTAL", "ACTIVE", Some("info@swiftcourier.bw"), None, "Express courier and parcel delivery service."),
        ("Zebra FM", "LIC-BCAST-0005", "BROADCAST_COMMERCIAL_RADIO", "BROADCASTING", "ACTIVE", Some("zebrafm@radio.bw"), None, "Commercial radio broadcaster."),
        ("RLM Wireless", "LIC-TELE-0005", "TELECOM_NETWORK", "TELECOM", "ACTIVE", Some("info@rlmwireless.bw"), None, "Wireless network service provider."),
        ("NetConnect BW", "LIC-INET-0002", "INTERNET_ISP", "INTERNET", "ACTIVE", Some("info@netconnect.bw"), Some("https://www.netconnect.bw"), "Enterprise internet service provider."),
        ("Speedy Parcels", "LIC-POST-0003", "POSTAL_COURIER", "POSTAL", "ACTIVE", Some("info@speedyparcels.bw"), None, "Door-to-door parcel delivery service."),
        ("SkyBroadcast BW", "LIC-BCAST-0006", "BROADCAST_PAY_TV", "BROADCASTING", "ACTIVE", Some("info@skybroadcast.bw"), None, "Satellite pay television service."),
        ("TeleStar BW", "LIC-TELE-0006", "TELECOM_CLASS", "TELECOM", "ACTIVE", Some("info@telestar.bw"), None, "Telecommunications service provider."),
        ("ConnectPro ISP", "LIC-INET-0003", "INTERNET_ISP", "INTERNET", "ACTIVE", Some("info@connectpro.bw"), None, "High-speed internet provider for businesses."),
        ("PostExpress BW", "LIC-POST-0004", "POSTAL_EXPRESS", "POSTAL", "SUSPENDED", Some("info@postexpress.bw"), None, "Express mail and logistics services. Currently suspended."),
        ("DigitalWave BW", "LIC-BCAST-0007", "BROADCAST_ONLINE", "BROADCASTING", "ACTIVE", Some("info@digitalwave.bw"), None, "Online broadcasting and streaming platform."),
    ];

    let mut licensee_ids: Vec<Uuid> = Vec::new();
    for (name, num, ltype, sector, status, email, website, desc) in &licensees_data {
        let id = sqlx::query_scalar!(
            r#"INSERT INTO licensees (company_name, license_number, license_type, sector, status, contact_email, website, description, license_start_date, license_end_date)
               VALUES ($1, $2, $3::license_type, $4, $5, $6, $7, $8, '2020-01-01', '2025-12-31')
               ON CONFLICT (license_number) DO UPDATE SET company_name = $1
               RETURNING id"#,
            name, num, ltype as _, sector, status, email.as_deref(), website.as_deref(), desc
        )
        .fetch_one(&pool)
        .await?;
        licensee_ids.push(id);
    }
    println!("Created {} licensees", licensees_data.len());

    println!("Seeding license applications...");
    let app_statuses = vec!["PENDING", "PENDING", "UNDER_REVIEW", "UNDER_REVIEW", "APPROVED", "APPROVED", "APPROVED", "REJECTED", "REJECTED", "PENDING"];
    let app_data = vec![
        ("TeleBW Startups Ltd", "TELECOM_CLASS", "applications@telebw.bw"),
        ("Radio Kalahari", "BROADCAST_COMMERCIAL_RADIO", "info@radiokalahari.bw"),
        ("NetVision ISP", "INTERNET_ISP", "apply@netvision.bw"),
        ("Botswana Express Parcels", "POSTAL_EXPRESS", "info@bwexpress.bw"),
        ("Botswana Broadband Co", "INTERNET_VSAT", "info@bwbroadband.bw"),
        ("Delta Telecoms", "TELECOM_INDIVIDUAL", "apply@deltatele.bw"),
        ("Sunshine Radio BW", "BROADCAST_COMMUNITY_RADIO", "info@sunshineradio.bw"),
        ("StarCourier Botswana", "POSTAL_COURIER", "apply@starcourier.bw"),
        ("VisionTV Botswana", "BROADCAST_FTA_TV", "info@visiontv.bw"),
        ("SkyLink Wireless", "TELECOM_NETWORK", "apply@skylink.bw"),
    ];

    for (i, ((bname, ltype, email), status)) in app_data.iter().zip(app_statuses.iter()).enumerate() {
        sqlx::query!(
            r#"INSERT INTO license_applications (applicant_id, license_type, business_name, contact_email, status, address)
               VALUES ($1, $2::license_type, $3, $4, $5::application_status, $6)
               ON CONFLICT DO NOTHING"#,
            admin_id,
            ltype as _,
            bname,
            email,
            status as _,
            "Plot 123, Gaborone, Botswana"
        )
        .execute(&pool)
        .await.ok();
    }
    println!("Created {} license applications", app_data.len());

    println!("Seeding complaints...");
    use chrono::Utc;
    let complaint_data = vec![
        ("BILLING", "TELECOM", "Overcharged on monthly bill", "OPEN", "HIGH"),
        ("COVERAGE", "TELECOM", "No signal in Tlokweng area for 3 days", "IN_PROGRESS", "URGENT"),
        ("SERVICE_QUALITY", "INTERNET", "Slow internet speeds, getting 1Mbps instead of 10Mbps advertised", "OPEN", "MEDIUM"),
        ("BILLING", "POSTAL", "Charged for undelivered package and no refund given", "RESOLVED", "MEDIUM"),
        ("CONTENT", "BROADCASTING", "Inappropriate content aired during children's viewing time", "OPEN", "HIGH"),
        ("SPAM", "TELECOM", "Receiving 20+ unsolicited SMS messages per day", "IN_PROGRESS", "LOW"),
        ("SERVICE_QUALITY", "TELECOM", "Call drops every few minutes in Francistown", "OPEN", "HIGH"),
        ("COVERAGE", "INTERNET", "No broadband access in Maun despite service promise", "ESCALATED", "URGENT"),
        ("BILLING", "TELECOM", "Double charged for international call package", "RESOLVED", "MEDIUM"),
        ("OTHER", "BROADCASTING", "Radio station operating outside licensed hours", "OPEN", "MEDIUM"),
        ("SERVICE_QUALITY", "POSTAL", "Package delivered damaged, compensation refused", "IN_PROGRESS", "MEDIUM"),
        ("BILLING", "INTERNET", "Charged after cancelling subscription 3 months ago", "OPEN", "HIGH"),
        ("COVERAGE", "TELECOM", "No 4G in Lobatse central business district", "IN_PROGRESS", "MEDIUM"),
        ("SPAM", "INTERNET", "ISP injecting ads into unencrypted web traffic", "ESCALATED", "HIGH"),
        ("SERVICE_QUALITY", "BROADCASTING", "BTV signal weak and pixelated in northern districts", "OPEN", "LOW"),
    ];

    for (i, (cat, sector, desc, status, priority)) in complaint_data.iter().enumerate() {
        let ticket = format!("BOCRA-2024-{:06}", 100001 + i);
        sqlx::query!(
            r#"INSERT INTO complaints (ticket_number, category, sector, description, status, priority)
               VALUES ($1, $2::complaint_category, $3::complaint_sector, $4, $5::complaint_status, $6::complaint_priority)
               ON CONFLICT (ticket_number) DO NOTHING"#,
            ticket, cat as _, sector as _, desc, status as _, priority as _
        )
        .execute(&pool)
        .await.ok();
    }
    println!("Created {} complaints", complaint_data.len());

    println!("Seeding consultations...");
    let now = chrono::Utc::now().date_naive();
    let consultations = vec![
        (
            "Draft Framework for 5G Spectrum Allocation in Botswana",
            "BOCRA invites public comments on the proposed framework for allocation of spectrum bands suitable for 5G deployment. This includes analysis of sub-6GHz and mmWave bands, sharing mechanisms, and licensing conditions.",
            "TELECOM",
            now - chrono::Duration::days(10),
            now + chrono::Duration::days(2),
            "OPEN"
        ),
        (
            "Review of Postal Service Quality Standards 2024",
            "This consultation reviews minimum service quality standards for postal and courier operators, including delivery timelines, tracking requirements, and consumer compensation frameworks.",
            "POSTAL",
            now - chrono::Duration::days(5),
            now + chrono::Duration::days(20),
            "OPEN"
        ),
        (
            "Broadcasting Content Regulation Guidelines",
            "Consultation on updated content standards for broadcasters, covering local content quotas, language requirements, and protection of vulnerable audiences.",
            "BROADCASTING",
            now - chrono::Duration::days(60),
            now - chrono::Duration::days(30),
            "CLOSED"
        ),
        (
            "Internet Interconnection and Traffic Management Policy",
            "Review of net neutrality principles and traffic management practices by internet service providers operating in Botswana.",
            "INTERNET",
            now - chrono::Duration::days(90),
            now - chrono::Duration::days(60),
            "CLOSED"
        ),
        (
            "Consumer Protection Framework for Digital Services",
            "Proposed framework for protecting consumers using digital communications services, including complaint resolution timelines and refund policies.",
            "TELECOM",
            now - chrono::Duration::days(120),
            now - chrono::Duration::days(90),
            "CLOSED"
        ),
    ];

    for (title, desc, sector, start, end, status) in &consultations {
        sqlx::query!(
            "INSERT INTO consultations (title, description, sector, start_date, end_date, status, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING",
            title, desc, sector, start, end, status, admin_id
        )
        .execute(&pool)
        .await.ok();
    }
    println!("Created {} consultations", consultations.len());

    println!("Seeding publications...");
    let publications = vec![
        ("BOCRA Annual Report 2023", "ANNUAL_REPORT", "TELECOM", "Comprehensive annual report detailing BOCRA's regulatory activities, licensing statistics, and market developments in 2023.", "2024-01-15T00:00:00Z"),
        ("BOCRA Annual Report 2022", "ANNUAL_REPORT", "TELECOM", "Annual report covering regulatory activities, enforcement actions, and sector statistics for 2022.", "2023-02-01T00:00:00Z"),
        ("Telecommunications Market Study 2024", "RESEARCH", "TELECOM", "In-depth analysis of the telecommunications market in Botswana, including competitive dynamics and consumer trends.", "2024-03-10T00:00:00Z"),
        ("Broadcasting Sector Guidelines v3.0", "GUIDELINE", "BROADCASTING", "Updated guidelines for broadcasting licensees covering content standards, technical requirements, and compliance procedures.", "2024-02-20T00:00:00Z"),
        ("Postal Service Quality Report Q3 2024", "REPORT", "POSTAL", "Quarterly assessment of postal service delivery performance across all licensed operators.", "2024-10-05T00:00:00Z"),
        ("Mobile Data Pricing Survey 2024", "RESEARCH", "INTERNET", "Analysis of mobile data prices in Botswana compared to regional benchmarks.", "2024-07-15T00:00:00Z"),
        ("Type Approval Procedures Manual", "GUIDELINE", "TELECOM", "Step-by-step procedures for equipment type approval applications.", "2024-01-30T00:00:00Z"),
        ("Spectrum Management Policy 2024", "POLICY", "TELECOM", "Updated spectrum management framework incorporating international standards and local requirements.", "2024-04-01T00:00:00Z"),
        ("Consumer Rights in Telecommunications", "GUIDE", "TELECOM", "Plain-language guide for consumers explaining their rights when dealing with telecommunications operators.", "2024-06-01T00:00:00Z"),
        ("Internet Service Providers Directory 2024", "DIRECTORY", "INTERNET", "Comprehensive listing of all licensed internet service providers in Botswana.", "2024-09-01T00:00:00Z"),
        ("Tariff Regulation Framework", "POLICY", "TELECOM", "Framework governing tariff-setting processes and approval requirements for regulated services.", "2024-03-15T00:00:00Z"),
        ("Broadcasting Licence Conditions 2024", "REGULATION", "BROADCASTING", "Complete licence conditions applicable to all broadcasting licensees.", "2024-01-10T00:00:00Z"),
        ("BOCRA Strategic Plan 2024-2028", "STRATEGIC_PLAN", "TELECOM", "Five-year strategic plan outlining BOCRA's priorities for market development and consumer protection.", "2024-04-15T00:00:00Z"),
        ("Press Release: 5G Spectrum Consultation Launch", "PRESS_RELEASE", "TELECOM", "Official press release announcing the public consultation on 5G spectrum allocation.", "2024-11-01T00:00:00Z"),
        ("Botswana ICT Indicators Report 2023", "REPORT", "INTERNET", "Key statistics on ICT adoption, internet penetration, and digital economy indicators.", "2024-02-28T00:00:00Z"),
        ("Frequency Assignment Procedures", "GUIDELINE", "TELECOM", "Procedures for applying for and managing frequency assignments.", "2023-11-15T00:00:00Z"),
        ("Postal Operators Compliance Checklist", "GUIDELINE", "POSTAL", "Compliance requirements for postal and courier operators.", "2024-08-01T00:00:00Z"),
        ("Digital Broadcasting Migration Roadmap", "POLICY", "BROADCASTING", "Timeline and technical requirements for migration from analogue to digital broadcasting.", "2024-05-20T00:00:00Z"),
        ("Universal Service Fund Annual Report 2023", "ANNUAL_REPORT", "TELECOM", "Report on the Universal Service Fund disbursements and rural connectivity projects.", "2024-03-30T00:00:00Z"),
        ("Cybersecurity Guidelines for ISPs", "GUIDELINE", "INTERNET", "Security requirements and recommendations for internet service providers.", "2024-09-15T00:00:00Z"),
    ];

    for (title, pub_type, sector, desc, published_at) in &publications {
        let pub_time: chrono::DateTime<Utc> = published_at.parse().unwrap();
        sqlx::query!(
            "INSERT INTO publications (title, type, sector, description, published_at, created_by) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING",
            title, pub_type, sector, desc, pub_time, admin_id
        )
        .execute(&pool)
        .await.ok();
    }
    println!("Created {} publications", publications.len());

    println!("Seeding news articles...");
    let articles = vec![
        ("bocra-launches-5g-consultation-2024", "BOCRA Launches Public Consultation on 5G Spectrum Allocation", "BOCRA has officially opened a public consultation process on the allocation of spectrum bands for 5G deployment in Botswana. The regulator is seeking input from industry stakeholders, civil society, and the general public.", "BOCRA opened the 5G spectrum consultation today.", "REGULATION", "TELECOM"),
        ("mascom-orange-dispute-resolution-2024", "BOCRA Mediates Dispute Between Mascom and Orange Over Roaming Rates", "The Botswana Communications Regulatory Authority has successfully mediated a dispute between Mascom Wireless and Orange Botswana regarding domestic roaming rate agreements.", "BOCRA resolved a key roaming rate dispute.", "ENFORCEMENT", "TELECOM"),
        ("btv-digital-migration-update", "BTV Digital Migration: 80% of Gaborone Now Covered", "Botswana Television has reached 80% coverage of the Gaborone metropolitan area with digital signals as part of the nationwide analogue switch-off programme.", "Digital migration progress update from BTV.", "ANNOUNCEMENT", "BROADCASTING"),
        ("postal-quality-report-q3", "Q3 2024 Postal Service Quality Report Shows Improvement", "BOCRA's third-quarter assessment of postal service quality shows significant improvement in delivery timelines across major operators.", "Postal quality metrics improved in Q3.", "REPORT", "POSTAL"),
        ("internet-penetration-hits-70-percent", "Botswana Internet Penetration Reaches 70% Milestone", "Internet penetration in Botswana has reached 70% of the population, according to BOCRA's latest ICT indicators report.", "70% internet penetration achieved.", "STATISTICS", "INTERNET"),
        ("new-isp-licenses-awarded-2024", "BOCRA Awards Three New ISP Licences in 2024", "Three new internet service provider licences have been awarded by BOCRA, expanding broadband competition in underserved areas.", "Three new ISP licences awarded.", "LICENSING", "INTERNET"),
        ("consumer-complaints-down-15-percent", "Consumer Complaints Fall 15% in 2024", "The number of formal consumer complaints lodged with BOCRA dropped by 15% in the first three quarters of 2024, indicating improving service quality.", "Consumer complaints reduced significantly.", "STATISTICS", "TELECOM"),
        ("bocra-type-approval-guidelines", "Updated Type Approval Guidelines Released for Electronic Equipment", "BOCRA has published revised guidelines for the type approval of electronic communications equipment, streamlining the approval process.", "New type approval guidelines published.", "REGULATION", "TELECOM"),
        ("rural-connectivity-fund-disbursements", "USF Awards BWP 25 Million for Rural Connectivity Projects", "The Universal Service Fund has approved BWP 25 million in grants for rural connectivity projects in the Central and Kgatleng districts.", "Major rural connectivity investment announced.", "FUNDING", "TELECOM"),
        ("mobile-data-prices-benchmark", "Botswana Mobile Data Prices Among Most Competitive in SADC", "A comparative study by BOCRA shows that mobile data prices in Botswana are among the most competitive in the Southern African Development Community region.", "Data pricing survey results released.", "RESEARCH", "INTERNET"),
        ("broadcast-content-complaints-spike", "BOCRA Investigates Spike in Broadcasting Content Complaints", "The authority has launched an investigation into a spike in consumer complaints about broadcast content standards during prime-time viewing hours.", "Content complaints investigated.", "ENFORCEMENT", "BROADCASTING"),
        ("spectrum-audit-results-2024", "National Spectrum Audit Reveals Underutilisation in Key Bands", "BOCRA's comprehensive spectrum audit has identified significant underutilisation in several frequency bands, prompting a review of allocation policies.", "Spectrum audit findings published.", "RESEARCH", "TELECOM"),
        ("postal-operator-suspended", "BOCRA Suspends PostExpress BW Licence Over Compliance Failures", "BOCRA has suspended the operating licence of PostExpress BW following repeated failures to meet service quality standards and consumer protection obligations.", "Postal operator licence suspended.", "ENFORCEMENT", "POSTAL"),
        ("annual-conference-2024", "BOCRA Annual Stakeholder Conference Scheduled for December 2024", "BOCRA's annual stakeholder conference will be held in Gaborone in December 2024, focusing on digital transformation and emerging technology regulation.", "Annual conference announced.", "EVENT", "TELECOM"),
        ("cybersecurity-guidelines-isps", "BOCRA Issues Cybersecurity Guidelines for Internet Service Providers", "New mandatory cybersecurity guidelines have been issued for all licensed internet service providers, requiring minimum security standards by Q1 2025.", "ISP cybersecurity standards announced.", "REGULATION", "INTERNET"),
    ];

    for (slug, title, content, excerpt, category, sector) in &articles {
        sqlx::query!(
            r#"INSERT INTO news_articles (slug, title, content, excerpt, category, sector, is_published, published_at, author_id)
               VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), $7)
               ON CONFLICT (slug) DO NOTHING"#,
            slug, title, content, excerpt, category, sector, admin_id
        )
        .execute(&pool)
        .await.ok();
    }
    println!("Created {} news articles", articles.len());

    println!("Seeding FAQ items...");
    let faqs = vec![
        ("How do I submit a complaint to BOCRA?", "You can submit a complaint through our online portal at /consumer/complaint, by email to complaints@bocra.org.bw, or by visiting our offices. You will receive a ticket number to track your complaint.", "COMPLAINTS", "TELECOM"),
        ("How long does BOCRA take to resolve complaints?", "BOCRA aims to acknowledge complaints within 2 business days and resolve them within 30 days. Complex cases may take longer.", "COMPLAINTS", "TELECOM"),
        ("Can I submit an anonymous complaint?", "Yes, you can submit complaints anonymously. However, providing contact details helps us update you on progress and request additional information if needed.", "COMPLAINTS", "TELECOM"),
        ("What types of complaints does BOCRA handle?", "BOCRA handles complaints about billing disputes, network coverage issues, service quality, unsolicited communications (spam), and content-related issues.", "COMPLAINTS", "TELECOM"),
        ("How do I apply for a telecommunications licence?", "Submit your application through our online portal at /licensing/apply. You will need to provide company registration documents, technical specifications, and pay the applicable fees.", "LICENSING", "TELECOM"),
        ("What is the difference between a Class and Individual licence?", "A Class licence permits operation under standardised conditions without individual negotiation, suitable for smaller operators. An Individual licence involves specific conditions negotiated with BOCRA, required for larger or complex operations.", "LICENSING", "TELECOM"),
        ("How long does licence processing take?", "Standard applications are processed within 60 business days. Complex applications requiring technical assessment may take up to 90 days.", "LICENSING", "TELECOM"),
        ("Can I track my licence application status?", "Yes, use the Track Application feature at /licensing/track with your reference number and email address.", "LICENSING", "TELECOM"),
        ("How do I get a broadcasting licence?", "Broadcasting licences require an application to BOCRA with content plans, technical specifications, and financial projections. Community radio licences have simplified requirements.", "LICENSING", "BROADCASTING"),
        ("What are the local content requirements for broadcasters?", "Licensed broadcasters must meet minimum local content quotas as specified in their licence conditions. Requirements vary by licence type.", "LICENSING", "BROADCASTING"),
        ("How do I participate in a public consultation?", "Visit /consultations to view open consultations. You can submit your comments online, by email, or by post during the consultation period.", "CONSULTATIONS", "TELECOM"),
        ("Are consultation submissions confidential?", "Submissions may be published unless you request confidentiality. Commercial secrets and personal information are protected.", "CONSULTATIONS", "TELECOM"),
        ("How do I get a postal or courier licence?", "Postal and courier operators must apply for a licence through BOCRA. Requirements include evidence of operational capacity, insurance, and compliance with consumer protection standards.", "LICENSING", "POSTAL"),
        ("What are my rights as a telecommunications consumer?", "You have the right to clear billing, adequate network coverage, quality service, dispute resolution, and protection from spam. See /consumer/rights for details.", "CONSUMER_RIGHTS", "TELECOM"),
        ("How do I report spam SMS or calls?", "Report spam through our complaint portal, selecting 'Spam' as the category. Provide the numbers involved and screenshots where possible.", "COMPLAINTS", "TELECOM"),
        ("What equipment needs type approval?", "All electronic communications equipment offered for sale or use in Botswana must have BOCRA type approval. This includes mobile phones, routers, and radio equipment.", "TYPE_APPROVAL", "TELECOM"),
        ("How do I apply for type approval?", "Submit a type approval application with technical documentation, test certificates from accredited laboratories, and the applicable fees.", "TYPE_APPROVAL", "TELECOM"),
        ("What is spectrum and how is it managed?", "Radio frequency spectrum is a limited natural resource that BOCRA manages to prevent interference and ensure efficient use. Operators must obtain frequency assignments to use spectrum.", "SPECTRUM", "TELECOM"),
        ("How do I access BOCRA publications?", "All BOCRA publications are available for download at /publications. Most documents are freely available in PDF format.", "PUBLICATIONS", "TELECOM"),
        ("How do I contact BOCRA?", "BOCRA offices are located at Gaborone, and open Monday to Friday, 8:00 AM to 5:00 PM. Contact us at info@bocra.org.bw or +267 395 8900.", "CONTACT", "TELECOM"),
        ("What is the Universal Service Fund?", "The Universal Service Fund provides subsidies for extending communications services to underserved rural and remote areas of Botswana.", "USF", "TELECOM"),
        ("Does BOCRA regulate internet content?", "BOCRA regulates internet service provision but does not generally regulate specific online content. However, ISPs must comply with consumer protection standards.", "REGULATION", "INTERNET"),
        ("What should I do if my internet service is much slower than advertised?", "First contact your ISP. If unresolved after 30 days, file a complaint with BOCRA including speed test results and correspondence with your ISP.", "COMPLAINTS", "INTERNET"),
        ("How is the broadcasting frequency allocated?", "BOCRA allocates broadcasting frequencies through a licensing process, considering technical criteria, available spectrum, and public interest.", "SPECTRUM", "BROADCASTING"),
        ("Can foreign companies get communications licences?", "Foreign companies can apply for licences but may need to meet local ownership requirements and register as a Botswana legal entity.", "LICENSING", "TELECOM"),
        ("What are roaming charges and how are they regulated?", "Roaming charges apply when using a foreign network. BOCRA monitors wholesale roaming rates between operators to ensure fair pricing.", "REGULATION", "TELECOM"),
        ("How does BOCRA enforce compliance?", "BOCRA uses inspections, audits, and complaint investigations to monitor compliance. Sanctions range from warnings to fines and licence suspension.", "ENFORCEMENT", "TELECOM"),
        ("What is an ISP and how do I choose one?", "An Internet Service Provider (ISP) connects you to the internet. Compare prices, speeds, coverage, and customer reviews. See our licensed ISPs directory at /licensing/licensees.", "CONSUMER_RIGHTS", "INTERNET"),
        ("How long should a postal delivery take?", "Licensed postal operators must meet delivery timelines as specified in their licences. Standard domestic mail should be delivered within 5 business days.", "SERVICE_STANDARDS", "POSTAL"),
        ("What documents do I need for a postal operator licence?", "You need company registration certificates, proof of insurance, financial statements, operational plans, and vehicle fleet documentation.", "LICENSING", "POSTAL"),
    ];

    for (question, answer, category, sector) in &faqs {
        sqlx::query!(
            "INSERT INTO faq_items (question, answer, category, sector) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING",
            question, answer, category, sector
        )
        .execute(&pool)
        .await.ok();
    }
    println!("Created {} FAQ items", faqs.len());

    println!("Seeding alerts...");
    let alerts = vec![
        ("5G Spectrum Consultation Open", "BOCRA is currently accepting public submissions on the 5G spectrum allocation framework. Deadline in 2 days.", "INFO", "TELECOM"),
        ("System Maintenance: Friday 22:00-02:00", "The BOCRA online portal will undergo scheduled maintenance. Some services may be unavailable.", "WARNING", "TELECOM"),
        ("New Broadcasting Content Guidelines Effective", "Updated content guidelines for broadcasters take effect from 1 January 2025. Licensees must ensure compliance.", "INFO", "BROADCASTING"),
        ("PostExpress BW Licence Suspended", "BOCRA has suspended the operating licence of PostExpress BW. Consumers should seek alternative postal services.", "ALERT", "POSTAL"),
    ];

    for (title, message, alert_type, sector) in &alerts {
        sqlx::query!(
            "INSERT INTO alerts (title, message, type, sector, created_by) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING",
            title, message, alert_type, sector, admin_id
        )
        .execute(&pool)
        .await.ok();
    }
    println!("Created {} alerts", alerts.len());

    println!("\n✅ Seed completed successfully!");
    println!("   Admin:  admin@bocra.org.bw / Admin123!");
    println!("   Staff:  staff@bocra.org.bw / Staff123!");
    Ok(())
}
