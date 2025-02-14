//import React, { useState, useEffect } from 'react';

/*  
* This is a temporary version of this function to generate the YAML file for the Docker Compose file.
* A real version would need to fetch the baseYaml value from https://dotcms.com/run/clean. 
* This is not possible in a dev environment due to CORS, and will need a bit of testing once deployed.
* However, we still need SOMETHING to get us started, so this is a stopgap measure.
*/
export default function DockerComposeYAML({ version, lts=false, dockerTag="latest", cleanStarter, demoStarter, includeDemo=false }: 
  { version: string, lts: boolean, dockerTag: string, cleanStarter: string, demoStarter: string, includeDemo: boolean }) {
  const cleanStarterURL = `https://repo.dotcms.com/artifactory/libs-release-local/com/dotcms/starter/empty_${cleanStarter}/starter-empty_${cleanStarter}.zip`
  const demoStarterURL = `https://repo.dotcms.com/artifactory/libs-release-local/com/dotcms/starter/${demoStarter}/starter-${demoStarter}.zip`
  const outputYaml = `
  # This Docker Compose file is used to spin up a local dotCMS container using Docker.
  # Simply place this file in the desired working directory and run 'docker compose up' to get started.
  # Version: ${version}${lts ? " LTS" : ""}
  # Demo Site ${includeDemo ? "Included" : "Excluded"}
  # Starter Image: ${includeDemo ? demoStarter : cleanStarter}

  services:
  db:
    image: pgvector/pgvector:pg16
    command: postgres -c 'max_connections=400' -c 'shared_buffers=128MB'
    environment:
      POSTGRES_USER: 'dotcmsdbuser'
      POSTGRES_PASSWORD: 'password'
      POSTGRES_DB: 'dotcms'
    volumes:
      - dbdata:/var/lib/postgresql/data
    networks:
      - db_net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U dotcmsdbuser -d dotcms -h localhost -p 5432"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  opensearch:
    image: opensearchproject/opensearch:1
    environment:
      cluster.name: "elastic-cluster"
      discovery.type: "single-node"
      bootstrap.memory_lock: "true"
      OPENSEARCH_JAVA_OPTS: "-Xmx1G"
    ulimits:
      memlock:
        soft: -1
        hard: -1
      nofile:
        soft: 65536
        hard: 65536
    ports:
      - "9200:9200"
      - "9600:9600"
    volumes:
      - opensearch-data:/usr/share/opensearch/data
    networks:
      - opensearch-net
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 2G

  dotcms:
    image: dotcms/dotcms:${dockerTag}
    environment:
      CMS_JAVA_OPTS: '-Xmx1g '
      LANG: 'C.UTF-8'
      TZ: 'UTC'
      DB_BASE_URL: "jdbc:postgresql://db/dotcms"
      DB_USERNAME: 'dotcmsdbuser'
      DB_PASSWORD: 'password'
      DOT_ES_AUTH_BASIC_PASSWORD: 'admin'
      DOT_ES_ENDPOINTS: 'https://opensearch:9200'
      DOT_INITIAL_ADMIN_PASSWORD: 'admin'
      DOT_DOTCMS_CLUSTER_ID: 'dotcms-production'
      GLOWROOT_ENABLED: 'true'
      GLOWROOT_WEB_UI_ENABLED: 'true' # Enable glowroot web ui on localhost.  do not use in production
      CUSTOM_STARTER_URL: '${includeDemo ? demoStarterURL : cleanStarterURL}'
    depends_on:
      - db
      - opensearch      
    volumes:
      - cms-shared:/data/shared
      #- {license_local_path}/license.zip:/data/shared/assets/license.zip
    networks:
      - db_net
      - opensearch-net
    ports:
      - "8082:8082"
      - "8443:8443"
      - "4000:4000" # Glowroot web ui if enabled

  networks:
    db_net:
    opensearch-net:

  volumes:
    cms-shared:
    dbdata:
    opensearch-data:`;
  const blob = new Blob([outputYaml], { type: 'text/yaml' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'docker-compose.yml';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}


/*
// Define types for the build data
interface BuildDoc {
  minor: string;
  dockerImage: string;
  lts: { selectValue: number };
  starter: { selectValue: string };
  eolDate: string;
  parent?: { eolDate: string };
}

// Define types for the selected version
interface SelectedVersion {
  dockertag: string;
  version: string;
  lts: boolean;
  starter: string;
}

export function DockerComposeYAML2({ selectedRelease }: { selectedRelease: string }) {
  // State for builds, sorted LTS builds, selected version, and checkbox
  const [builds, setBuilds] = useState<BuildDoc[]>([]);
  const [sortedLTS, setSortedLTS] = useState<BuildDoc[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<SelectedVersion | null>(null);
  const [includeDemo, setIncludeDemo] = useState<boolean>(false);
  const [yamlContent, setYamlContent] = useState<string>('');

  // Simulate fetching builds data (replace with actual API call)
  useEffect(() => {
    // Mock data for builds (replace with actual data fetching logic)
    const mockBuilds: BuildDoc[] = [
      {
        minor: '5.3.8',
        dockerImage: 'dotcms/dotcms:5.3.8',
        lts: { selectValue: 1 },
        starter: { selectValue: '123' },
        eolDate: '2025-12-31',
        parent: { eolDate: '2025-12-31' },
      },
      {
        minor: '5.2.10',
        dockerImage: 'dotcms/dotcms:5.2.10',
        lts: { selectValue: 3 },
        starter: { selectValue: '456' },
        eolDate: '2024-12-31',
        parent: { eolDate: '2024-12-31' },
      },
    ];

    setBuilds(mockBuilds);

    // Sort LTS builds (logic from VTL)
    const today = new Date();
    const ltsBuilds = mockBuilds
      .filter((buildDoc) => {
        const realEOL = buildDoc.parent?.eolDate || buildDoc.eolDate;
        return (
          buildDoc.lts.selectValue === 1 &&
          new Date(realEOL) >= today
        );
      })
      .sort((a, b) => {
        const aEOL = a.parent?.eolDate || a.eolDate;
        const bEOL = b.parent?.eolDate || b.eolDate;
        return new Date(aEOL).getTime() - new Date(bEOL).getTime();
      })
      .slice(0, 3); // Limit to 3 LTS builds

    setSortedLTS(ltsBuilds);
  }, []);

  // Handle version selection change
  const handleVersionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue: SelectedVersion = JSON.parse(event.target.value);
    setSelectedVersion(selectedValue);
    updateYAML(selectedValue, includeDemo);
  };

  // Handle checkbox change
  const handleIncludeDemoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setIncludeDemo(checked);
    if (selectedVersion) {
      updateYAML(selectedVersion, checked);
    }
  };

  // Update YAML content
  const updateYAML = (version: SelectedVersion, includeDemo: boolean) => {
    const baseYAML = `# Sample Docker Compose file for dotCMS ${version.version}${includeDemo ? ' + Demo Site' : ''}\n\n` +
      `version: '3.7'\n` +
      `services:\n` +
      `  dotcms:\n` +
      `    image: ${version.dockertag}\n` +
      `    ports:\n` +
      `      - "8080:8080"\n`;

    let modYAML = baseYAML;

    if (includeDemo) {
      modYAML = modYAML.replace(
        /#CUSTOM_STARTER_URL: 'https:\/\/repo.dotcms.com\/artifactory\/libs-release-local\/com\/dotcms\/starter\/[0-9]+\/starter-[0-9]+.zip'/,
        `CUSTOM_STARTER_URL: 'https://repo.dotcms.com/artifactory/libs-release-local/com/dotcms/starter/${version.starter}/starter-${version.starter}.zip'`
      );
    }

    setYamlContent(modYAML);
  };

  // Download YAML file
  const downloadYAML = () => {
    const blob = new Blob([yamlContent], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'docker-compose.yml';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section>
      <h2>Download Docker Compose YAML</h2>
      <p>
        Spin up your own local dotCMS container using{' '}
        <a href="https://docs.docker.com/get-docker/" target="_blank" rel="noopener nofollow">
          Docker
        </a>{' '}
        in mere moments!
      </p>
      <ol>
        <li>Select a version from the dropdown.</li>
        <li>
          Choose either a clean (i.e., empty) starter or one bundled with a copy of the <a href="https://demo.dotcms.com" target="_blank" rel="noopener">dotCMS Demo Site</a>.
        </li>
        <li>
          Download the file to your chosen working directory and use <code>docker compose up</code>.
        </li>
      </ol>

      <div>
        <label htmlFor="versiondrop">Choose a version:</label>
        <select
          id="versiondrop"
          name="versiondrop"
          onChange={handleVersionChange}
          className="px-1 d-block py-2 mb-2 rounded"
          style={{ borderColor: '#dee2e6' }}
        >
          {builds.map((buildDoc) =>
            buildDoc.lts.selectValue === 3 ? (
              <option
                key={buildDoc.minor}
                value={JSON.stringify({
                  dockertag: buildDoc.dockerImage,
                  version: buildDoc.minor,
                  lts: false,
                  starter: buildDoc.starter.selectValue,
                })}
              >
                dotCMS {buildDoc.minor}
              </option>
            ) : null
          )}
          {sortedLTS.map((buildDoc) => (
            <option
              key={buildDoc.minor}
              value={JSON.stringify({
                dockertag: buildDoc.dockerImage,
                version: buildDoc.minor,
                lts: true,
                starter: buildDoc.starter.selectValue,
              })}
            >
              dotCMS {buildDoc.minor} LTS
            </option>
          ))}
        </select>

        <div className="d-flex flex-row justify-content-between">
          <label htmlFor="includeDemo" className="incl-container px-3 py-2 d-block ml-0">
            <input
              type="checkbox"
              id="includeDemo"
              name="includeDemo"
              onChange={handleIncludeDemoChange}
              className="mt-1"
            />
            <span className="checkmark rounded"></span>
            <label htmlFor="includeDemo" className="ml-4 mt-1 unselectable" style={{ cursor: 'inherit' }}>
              Include Demo Site
            </label>
          </label>

          <div>
            <button id="dl-a-yml" className="btn btn-secondary btn-md" onClick={downloadYAML}>
              <strong>Download YAML</strong>
            </button>
          </div>
        </div>

        <pre id="release-yaml-raw" style={{ padding: '20px', fontSize: '14px', lineHeight: '16px', marginTop: '4px', height: '450px', overflow: 'scroll', backgroundColor: '#eeeeee' }}>
          {yamlContent}
        </pre>
      </div>
    </section>
  );
};

//export DockerComposeYAML2;
*/