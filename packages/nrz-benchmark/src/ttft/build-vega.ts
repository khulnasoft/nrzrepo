import fetch from "node-fetch";
import vega from "vega";
import { put } from "@vercel/blob";
import sharp from "sharp";
import type { TTFTData } from "../helpers";

const TINYBIRD_AGGREGATE =
  "https://api.us-east.tinybird.co/v0/pipes/nrzrepo_perf_ttft_all.json";

const PNG_FILENAME = "aggregate.png";

async function fetchAggregateFromTinybird(): Promise<{
  data: Array<TTFTData>;
}> {
  const token = process.env.TINYBIRD_TOKEN;
  const resp = await fetch(`${TINYBIRD_AGGREGATE}?token=${token}`);
  return resp.json() as Promise<{ data: Array<TTFTData> }>;
}

function generateVegaSpec(aggregateData: { data: Array<TTFTData> }): vega.Spec {
  const source0: vega.ValuesData = {
    name: "source_0",
    values: aggregateData.data,
    transform: [
      {
        type: "formula",
        expr: "datum.durationMicroseconds/1000",
        as: "durationMs",
      },
    ],
  };
  // Note that this spec is mostly generated by using the vega editor
  // and then downloading the resulting spec.
  const vegaConfig: vega.Spec = {
    $schema: "https://vega.github.io/schema/vega/v5.json",
    width: 600,
    height: 400,
    background: "white",
    style: "cell",
    padding: 5,
    marks: [
      {
        name: "layer_0_pathgroup",
        type: "group",
        from: {
          facet: {
            name: "faceted_path_layer_0_main",
            data: "source_0",
            groupby: ["platform"],
          },
        },
        encode: {
          update: {
            width: { field: { group: "width" } },
            height: { field: { group: "height" } },
          },
        },
        marks: [
          {
            name: "layer_0_marks",
            type: "line",
            style: ["line"],
            sort: { field: 'datum["commitTimestamp"]' },
            from: { data: "faceted_path_layer_0_main" },
            encode: {
              update: {
                stroke: { scale: "color", field: "platform" },
                tooltip: {
                  signal:
                    '{"commitSha": isValid(datum["commitSha"]) ? datum["commitSha"] : ""+datum["commitSha"], "commitTimestamp": isValid(datum["commitTimestamp"]) ? datum["commitTimestamp"] : ""+datum["commitTimestamp"], "durationMicroseconds": format(datum["durationMicroseconds"], ""), "nrzVersion": isValid(datum["nrzVersion"]) ? datum["nrzVersion"] : ""+datum["nrzVersion"]}',
                },
                description: {
                  signal:
                    '"timestamp: " + (isValid(datum["commitTimestamp"]) ? datum["commitTimestamp"] : ""+datum["commitTimestamp"]) + "; duration (ms): " + (format(datum["durationMs"], "")) + "; platform: " + (isValid(datum["platform"]) ? datum["platform"] : ""+datum["platform"]) + "; commitSha: " + (isValid(datum["commitSha"]) ? datum["commitSha"] : ""+datum["commitSha"]) + "; commitTimestamp: " + (isValid(datum["commitTimestamp"]) ? datum["commitTimestamp"] : ""+datum["commitTimestamp"]) + "; durationMicroseconds: " + (format(datum["durationMicroseconds"], "")) + "; nrzVersion: " + (isValid(datum["nrzVersion"]) ? datum["nrzVersion"] : ""+datum["nrzVersion"])',
                },
                x: { scale: "x", field: "commitTimestamp" },
                y: { scale: "y", field: "durationMs" },
                defined: {
                  signal:
                    'isValid(datum["durationMs"]) && isFinite(+datum["durationMs"])',
                },
              },
            },
          },
        ],
      },
      {
        name: "layer_1_marks",
        type: "symbol",
        style: ["point"],
        from: { data: "data_0" },
        encode: {
          update: {
            opacity: { value: 1 },
            fill: { scale: "color", field: "platform" },
            tooltip: {
              signal:
                '{"commitSha": isValid(datum["commitSha"]) ? datum["commitSha"] : ""+datum["commitSha"], "commitTimestamp": isValid(datum["commitTimestamp"]) ? datum["commitTimestamp"] : ""+datum["commitTimestamp"], "durationMicroseconds": format(datum["durationMicroseconds"], ""), "nrzVersion": isValid(datum["nrzVersion"]) ? datum["nrzVersion"] : ""+datum["nrzVersion"]}',
            },
            ariaRoleDescription: { value: "point" },
            description: {
              signal:
                '"timestamp: " + (isValid(datum["commitTimestamp"]) ? datum["commitTimestamp"] : ""+datum["commitTimestamp"]) + "; duration (ms): " + (format(datum["durationMs"], "")) + "; platform: " + (isValid(datum["platform"]) ? datum["platform"] : ""+datum["platform"]) + "; commitSha: " + (isValid(datum["commitSha"]) ? datum["commitSha"] : ""+datum["commitSha"]) + "; commitTimestamp: " + (isValid(datum["commitTimestamp"]) ? datum["commitTimestamp"] : ""+datum["commitTimestamp"]) + "; durationMicroseconds: " + (format(datum["durationMicroseconds"], "")) + "; nrzVersion: " + (isValid(datum["nrzVersion"]) ? datum["nrzVersion"] : ""+datum["nrzVersion"])',
            },
            x: { scale: "x", field: "commitTimestamp" },
            y: { scale: "y", field: "durationMs" },
          },
        },
      },
    ],
    scales: [
      {
        name: "x",
        type: "point",
        domain: {
          fields: [
            { data: "source_0", field: "commitTimestamp" },
            { data: "data_0", field: "commitTimestamp" },
          ],
          sort: true,
        },
        range: [0, { signal: "width" }],
        padding: 0.5,
      },
      {
        name: "y",
        type: "linear",
        domain: {
          fields: [
            { data: "source_0", field: "durationMs" },
            { data: "data_0", field: "durationMs" },
          ],
        },
        range: [{ signal: "height" }, 0],
        nice: true,
        zero: true,
      },
      {
        name: "color",
        type: "ordinal",
        domain: {
          fields: [
            { data: "source_0", field: "platform" },
            { data: "data_0", field: "platform" },
          ],
          sort: true,
        },
        range: "category",
      },
    ],
    axes: [
      {
        scale: "y",
        orient: "left",
        gridScale: "x",
        grid: true,
        tickCount: { signal: "ceil(height/40)" },
        domain: false,
        labels: false,
        aria: false,
        maxExtent: 0,
        minExtent: 0,
        ticks: false,
        zindex: 0,
      },
      {
        scale: "x",
        orient: "bottom",
        grid: false,
        title: "timestamp",
        labelAlign: "right",
        labelAngle: 270,
        labelBaseline: "middle",
        zindex: 0,
      },
      {
        scale: "y",
        orient: "left",
        grid: false,
        title: "duration (ms)",
        labelOverlap: true,
        tickCount: { signal: "ceil(height/40)" },
        zindex: 0,
      },
    ],
    legends: [
      {
        stroke: "color",
        symbolType: "circle",
        title: "platform",
        fill: "color",
        encode: { symbols: { update: { opacity: { value: 1 } } } },
      },
    ],
    data: [
      source0,
      {
        name: "data_0",
        source: "source_0",
        transform: [
          {
            type: "filter",
            expr: 'isValid(datum["durationMs"]) && isFinite(+datum["durationMs"])',
          },
        ],
      },
    ],
  };
  return vegaConfig;
}

async function generatePng(vegaConfig: vega.Spec): Promise<Buffer> {
  const view = new vega.View(vega.parse(vegaConfig), {
    renderer: "none",
  });
  const svg = await view.toSVG();

  return sharp(Buffer.from(svg)).toFormat("png").toBuffer();
}

async function uploadBlob(buffer: Buffer): Promise<string> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const resp = await put(PNG_FILENAME, buffer, {
    token,
    access: "public",
  });
  return resp.url;
}

// uploadAggregate returns the URL of the uploaded image
export async function uploadAggregate(): Promise<string> {
  const aggregateData = await fetchAggregateFromTinybird();
  const vegaSpec = generateVegaSpec(aggregateData);
  const pngBuffer = await generatePng(vegaSpec);
  return uploadBlob(pngBuffer);
}
