import React, { useState, useEffect, useRef, useCallback } from "react";
import Tree from "react-d3-tree";
import { useDocumentHandler } from "../hooks/useDocumentHandler";
import "../styles/components/TreePage.css";
import "../styles/components/TreeNode.css";
import "../styles/global.css";

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

const TreeModal = ({ fileName, onClose }) => {
  const { documents } = useDocumentHandler();
  const [treeData, setTreeData] = useState(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [isExpanded, setIsExpanded] = useState(false);

  // 초기 트리 데이터 설정
  useEffect(() => {
    if (documents && fileName) {
      const currentDoc = documents.find((doc) => doc.title === fileName);
      if (currentDoc && currentDoc.toc) {
        const initialData = transformToTree(fileName, currentDoc.toc);
        // 초기 데이터에 collapsed 상태 추가
        const addCollapsedState = (node) => {
          const newNode = { ...node };
          if (newNode.children && newNode.children.length > 0) {
            newNode.__rd3t = { collapsed: true };
            newNode.children = newNode.children.map(addCollapsedState);
          }
          return newNode;
        };
        setTreeData(addCollapsedState(initialData));
      }
    }
  }, [documents, fileName]);

  // 트리 확장/축소 토글
  const toggleTreeExpansion = useCallback(() => {
    if (!treeData) return;

    const toggleNodes = (node) => {
      const newNode = { ...node };
      if (newNode.children && newNode.children.length > 0) {
        newNode.__rd3t = { collapsed: isExpanded };
        newNode.children = newNode.children.map(toggleNodes);
      }
      return newNode;
    };

    setTreeData(toggleNodes(treeData));
    setIsExpanded(!isExpanded);
  }, [treeData, isExpanded]);

  // 개별 노드 렌더링
  const renderCustomNode = ({ nodeDatum, toggleNode }) => {
    const hasChildren = nodeDatum.children && nodeDatum.children.length > 0;
    const isNodeActive = hasChildren && !nodeDatum.__rd3t?.collapsed;

    const nodeClasses = ["tree-node", hasChildren ? "has-children" : "", isNodeActive ? "active" : ""]
      .filter(Boolean)
      .join(" ");

    return (
      <g onClick={toggleNode}>
        <foreignObject x={-100} y={-20} width={200} height={60}>
          <div className={nodeClasses} title={nodeDatum.name}>
            <div className="tree-node-title">{nodeDatum.name}</div>
          </div>
        </foreignObject>
      </g>
    );
  };

  if (!treeData) {
    return <div className="tree-modal-loading">Loading...</div>;
  }

  return (
    <div className="tree-modal-overlay" onClick={onClose}>
      <div className="tree-modal" ref={containerRef} onClick={(e) => e.stopPropagation()}>
        <div className="tree-modal-header">
          <div className="tree-header">
            <h2 className="tree-title">{fileName} 의 목차 트리</h2>
            <button
              className="tree-toggle-btn"
              onClick={(e) => {
                e.stopPropagation();
                toggleTreeExpansion();
              }}
            >
              {isExpanded ? "모두 접기" : "모두 펼치기"}
            </button>
          </div>
          <button className="tree-modal-close" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="tree-content">
          <Tree
            data={treeData}
            orientation="horizontal"
            translate={{ x: 120, y: 400 }}
            nodeSize={{ x: 220, y: 30 }}
            separation={{ siblings: 1.5, nonSiblings: 2 }}
            pathFunc="step"
            collapsible={true}
            initialDepth={isExpanded ? Infinity : 1}
            renderCustomNodeElement={renderCustomNode}
            pathClassFunc={() => "tree-link"}
            zoomable={true}
          />
        </div>
      </div>
    </div>
  );
};

export default TreeModal;
