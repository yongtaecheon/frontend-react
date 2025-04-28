import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Tree from "react-d3-tree";
import { useDocumentHandler } from "../hooks/useDocumentHandler";
import "../styles/components/TreePage.css";
import "../styles/components/TreeNode.css";

// TOC 데이터를 react-d3-tree 형식으로 변환하는 함수
const transformToTree = (fileName, nodes) => {
  const nodeMap = {}; // id를 키로 하는 노드 맵
  const rootNodes = []; // 최상위 노드들을 저장할 배열
  console.log(nodes);
  // 1단계: 모든 노드를 기본 형태로 초기화
  nodes.forEach((node) => {
    nodeMap[node.id] = {
      name: node.title, // react-d3-tree는 'name' 속성을 사용
      children: [], // 자식 노드를 저장할 배열
      // attributes: {
      //   // 추가 정보를 attributes에 저장
      //   "페이지 번호": node.page,
      //   담당자: node.persons.map((person) => person.name),
      //   "Jira 이슈": node.issues.map((issue) => issue.title),
      // },
    };
  });

  // 2단계: 부모-자식 관계 설정
  nodes.forEach((node) => {
    console.log();
    if (node.subKeywords && node.subKeywords.length > 0) {
      // subKeywords 배열의 각 id에 해당하는 노드를 현재 노드의 자식으로 추가
      node.subKeywords.forEach((childId) => {
        if (nodeMap[childId]) {
          nodeMap[node.id].children.push(nodeMap[childId]);
        }
      });
    }
  });

  // 최상위 노드(parentId가 null인 노드) 찾기
  nodes.forEach((node) => {
    if (!node.parentId) {
      rootNodes.push(nodeMap[node.id]);
    }
  });

  if (rootNodes.length > 1) {
    return { name: fileName, children: rootNodes };
  }

  return rootNodes[0] || { name: "No Data", children: [] }; // 항상 단일 루트 노드 반환
};

const TreePage = () => {
  const { fileName } = useParams();
  console.log(fileName);
  console.log(decodeURIComponent(fileName));
  console.log(encodeURIComponent(fileName));
  const { documents } = useDocumentHandler();
  const [treeData, setTreeData] = useState(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // 컨테이너 크기 감지
  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        if (entries[0]) {
          setDimensions({
            width: entries[0].contentRect.width,
            height: entries[0].contentRect.height,
          });
        }
      });

      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  // documents가 로드되면 현재 파일의 TOC 데이터를 트리 데이터로 변환
  useEffect(() => {
    if (documents && fileName) {
      const currentDoc = documents.find((doc) => doc.title === decodeURIComponent(fileName));
      console.log(currentDoc);
      if (currentDoc && currentDoc.toc) {
        const transformedData = transformToTree(fileName, currentDoc.toc);
        setTreeData(transformedData);
      }
    }
  }, [documents, fileName]);

  const renderCustomNode = ({ nodeDatum, toggleNode }) => (
    <g>
      <circle r={15} onClick={toggleNode} className="tree-node-circle" fill="#4f423c" stroke="#fff" strokeWidth="2" />
      <foreignObject x={20} y={-20} width={200} height={100}>
        <div className="tree-node">
          <div className="tree-node-title">{nodeDatum.name}</div>
        </div>
      </foreignObject>
    </g>
  );

  if (!treeData) {
    return <div className="tree-loading">Loading...</div>;
  }
  console.log(treeData);
  return (
    <div className="tree-container" ref={containerRef}>
      <h2 className="tree-title">{fileName} - Document Structure</h2>
      <div className="tree-content">
        <Tree
          data={treeData}
          orientation="vertical"
          translate={{ x: dimensions.width / 2, y: 50 }}
          nodeSize={{ x: 100, y: 200 }}
          separation={{ siblings: 2, nonSiblings: 3 }}
          pathFunc="step"
          collapsible={true}
          initialDepth={1}
          renderCustomNodeElement={renderCustomNode}
        />
      </div>
    </div>
  );
};

export default TreePage;
